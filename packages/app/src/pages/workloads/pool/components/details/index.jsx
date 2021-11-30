import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import classnames from "classnames"
import moment from "moment"
import QRCode from "qrcode"
import html2pdf from "html2pdf.js"

import "./index.less"

const api = window.app.request
const dateFormat = "DD-MM-YYYY hh:mm"

export default class WorkloadDetails extends React.Component {
	ref = React.createRef()
	state = {
		data: null,
		qrCanvas: null,
	}

	componentDidMount = async () => {
		if (typeof this.props.id === "string") {
			this.id = this.props.id
		}

		const data = await api.get.workload(undefined, { _id: this.id })
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
			<div className="workload_details" id={this.id} ref={this.ref} >
				<div className="header">
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
							<antd.Tag>
								<Icons.Tag />
								ID {this.id}
							</antd.Tag>
							<antd.Tag>
								<Icons.User />
								NOF {data.nof}
							</antd.Tag>
							<antd.Tag>
								<Icons.GitBranch />
								Phase {data.phase}
							</antd.Tag>
							<antd.Tag>
								<Icons.Activity />
								{data.status}
							</antd.Tag>
						</div>
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

				<div key="scheduled">
					<h2>
						<Icons.Calendar /> Scheduled
					</h2>
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
				</div>

				<div>
					<antd.Row gutter={[16, 16]}>
						<antd.Col span={12}>
							<div>
								<h2>
									<Icons.Watch /> Timeline
								</h2>
								<antd.Timeline mode="left">
									<antd.Timeline.Item label={createdDate.toLocaleString()}>
										Workload was created
									</antd.Timeline.Item>
								</antd.Timeline>
							</div>
						</antd.Col>

						<antd.Col span={12}>
							<div>
								<h2>
									<Icons.Users /> Operators
								</h2>
								<antd.List
									dataSource={data.assigned}
									renderItem={(operator) => (
										<List.Item key={operator._id}>
											<List.Item.Meta
												avatar={<Avatar src={operator.avatar} />}
												title={<a>{operator.fullName}</a>}
												description={operator.email}
											/>
										</List.Item>
									)}
								/>
							</div>
						</antd.Col>
					</antd.Row>
				</div>
				<div key="assigned"></div>
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
