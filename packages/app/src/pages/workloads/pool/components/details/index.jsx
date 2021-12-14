import React from "react"
import * as antd from "antd"
import classnames from "classnames"
import moment from "moment"
import QRCode from "qrcode"
import { Icons } from "components/Icons"
import { OperatorsAssignments } from "components"

import "./index.less"

const dateFormat = "DD-MM-YYYY hh:mm"

export default class WorkloadDetails extends React.Component {
	ref = React.createRef()
	state = {
		data: null,
		qrCanvas: null,
	}

	api = window.app.request

	componentDidMount = async () => {
		if (typeof this.props.id === "string") {
			this.id = this.props.id
		}

		const data = await this.api.get.workload(undefined, { _id: this.id })
		const qr = await this.createQR()

		this.setState({ data, qrCanvas: qr })
	}

	createQR = async () => {
		const data = await QRCode.toCanvas(this.id, { errorCorrectionLevel: "H", scale: 8 })

		return data
	}

	downloadQR = () => {
		const qr = this.state.qrCanvas
		const link = document.createElement("a")

		link.download = `qr_${this.id}.png`
		link.href = qr.toDataURL()
		link.click()
	}

	isDateReached = (date) => {
		const now = moment().format(dateFormat)
		const result = moment(date, dateFormat).isSameOrBefore(moment(now, dateFormat))

		//console.log(`[${date}] is before [${now}] => ${result}`)

		return result
	}

	getDiffBetweenDates = (start, end) => {
		const format = "DD-MM-YYYY"

		const startDate = moment(start, format)
		const endDate = moment(end, format)
		const now = moment().format(format)

		// count days will took to complete
		const days = endDate.diff(startDate, "days")

		const daysLeft = endDate.diff(moment(now, format), "days")
		const daysPassed = moment(now, format).diff(startDate, "days")

		let percentage = 0

		switch (daysLeft) {
			case 0: {
				percentage = 99
				break
			}
			case 1: {
				percentage = 95
				break
			}
			default: {
				if (daysPassed > 0 && daysPassed < days) {
					percentage = (daysPassed / days) * 100
				}
				break
			}
		}

		if (daysPassed > days) {
			percentage = 100
		}

		return { daysLeft, daysPassed, percentage }
	}

	openItemDetails = (uuid) => {
		console.log(`Opening item details with UUID[${uuid}]`)
	}

	onAssignOperators = async (ctx, data) => {
		const result = await this.api.put.workloadOperators({
			_id: this.state.data._id,
			operators: data,
		}).catch((err) => {
			ctx.handleFail(err)
			return false
		})

		if (result) {
			ctx.close()
			this.setState({ data: result })
			this.forceUpdate()
		}
	}

	parseWorkloadItems = (items) => {
		return items.map((item) => {
			const obj = {
				uuid: item.uuid,
				quantity: item.quantity,
				item: {
					item_id: item.id,
					name: item.title,
				},
			}

			return obj
		})
	}

	isExpired = (isFinishReached, status) => {
		if (status !== "completed" && isFinishReached) {
			return true
		}
		return false
	}

	render() {
		const { data } = this.state

		if (data == null) {
			return <antd.Skeleton active />
		}

		const createdDate = new Date(data.created)
		const startReached = this.isDateReached(data.scheduledStart)
		const finishReached = this.isDateReached(data.scheduledFinish)

		const datesDiff = this.getDiffBetweenDates(data.scheduledStart, data.scheduledFinish)
		const isExpired = this.isExpired(finishReached, data.status)

		const getSchedulerProgressStatus = () => {
			let status = "normal"

			if (isExpired && data.status !== "completed") {
				return "exception"
			} else {
				switch (data.status) {
					case "complete": {
						status = undefined
						break
					}
					default: {
						status = "active"
						break
					}
				}
			}

			return status
		}

		return (
			<div className={classnames("workload_details", { ["mobile"]: window.isMobile })} id={this.id} ref={this.ref} >
				<div className="details_header">
					<div className="content">
						<h1>
							<antd.Badge.Ribbon
								text={isExpired ? "expired" : `${datesDiff.daysLeft} days left`}
								color={isExpired ? "red" : undefined}
							>
								<Icons.Box /> {data.name}
							</antd.Badge.Ribbon>
						</h1>

						<div>
							<antd.Button icon={<Icons.Save />}>
								Export
							</antd.Button>
						</div>
					</div>

					<div className="matrix">
						<antd.Tooltip placement="bottom" title="Download">
							<img onClick={this.downloadQR} src={this.state.qrCanvas.toDataURL()} />
						</antd.Tooltip>
					</div>
				</div>

				<div className="info">
					<div key="id">
						<div className="name">
							<Icons.Tag />
							ID
						</div>
						<div className="value">
							{this.id}
						</div>
					</div>
					<div key="nof">
						<div className="name">
							<Icons.User />
							NOF
						</div>
						<div className="value">
							{data.nof}
						</div>
					</div>
					<div key="phase">
						<div className="name">
							<Icons.GitBranch />
							Phase
						</div>
						<div className="value">
							{data.phase}
						</div>
					</div>
					<div key="state">
						<div className="name">
							<Icons.Activity />
							State
						</div>
						<div className="value">
							{data.status}
						</div>
					</div>
				</div>

				<antd.Collapse
					bordered={false}
					accordion={true}
					expandIconPosition={"right"}
					className="details_collapseList"
				>
					<antd.Collapse.Panel key="scheduled" header={<h2><Icons.Calendar /> Scheduled</h2>}>
						<div className="scheduled_progress">
							<div className={classnames("point", "left", { reached: startReached })}>
								{data.scheduledStart}
							</div>
							<antd.Progress
								size="small"
								percent={datesDiff.percentage}
								showInfo={false}
								className={classnames("ant-progress", {
									startReached: startReached,
									finishReached: finishReached,
								})}
								type="line"
								status={getSchedulerProgressStatus()}
							/>
							<div className={classnames("point", "right", { reached: finishReached })}>
								{data.scheduledFinish}
							</div>
						</div>
					</antd.Collapse.Panel>

					<antd.Collapse.Panel key="timeline" header={<h2><Icons.Watch /> Timeline</h2>}>
						<antd.Timeline mode="left">
							<antd.Timeline.Item label={createdDate.toLocaleString()}>
								Workload was created
							</antd.Timeline.Item>
						</antd.Timeline>
					</antd.Collapse.Panel>

					<antd.Collapse.Panel key="operators" header={<h2><Icons.Users /> Operators</h2>}>
						<OperatorsAssignments onAssignOperators={this.onAssignOperators} assigned={data.assigned} />
					</antd.Collapse.Panel>
				</antd.Collapse>

				<div key="items">
					<h2>
						<Icons.Archive /> Order
					</h2>
					<antd.Table
						dataSource={this.parseWorkloadItems(data.items)}
						columns={[
							{
								title: "UUID",
								dataIndex: "uuid",
								key: "uuid",
								render: (uuid) => {
									return <a onClick={() => this.openItemDetails(uuid)}>{uuid}</a>
								},
							},
							{
								title: "Item",
								dataIndex: "item",
								key: "item",
								render: (item) => {
									return (
										<div>
											<div>{item.name}</div>
											<div>
												<antd.Tag color="blue">{item.item_id}</antd.Tag>
											</div>
										</div>
									)
								},
							},
							{
								title: "quantity",
								dataIndex: "quantity",
								key: "quantity",
							},
						]}
					/>
				</div>
			</div>
		)
	}
}
