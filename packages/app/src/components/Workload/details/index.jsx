import React from "react"
import * as antd from "antd"
import classnames from "classnames"
import moment from "moment"
import QRCode from "qrcode"
import { Icons } from "components/Icons"
import { OperatorsAssignments, UserSelector, Fabric, ScheduledProgress } from "components"

import { OrdersRender } from ".."

import "./index.less"

const dateFormat = "DD-MM-YYYY hh:mm"

export default class WorkloadDetails extends React.Component {
	state = {
		data: null,
		qrCanvas: null,
	}

	ref = React.createRef()
	api = window.app.request

	componentDidMount = async () => {
		// TODO: Handle undefined ID
		if (typeof this.props.id === "string") {
			this.id = this.props.id
		}

		const qr = await this.createQR()
		await this.fetchData()

		await this.setState({ qrCanvas: qr })
	}

	fetchData = async () => {
		await this.setState({ data: null })

		const result = await this.api.get.workload(undefined, { _id: this.id }).catch((err) => {
			antd.message.error(err)
			console.error(err)
			return false
		})

		console.log(result)

		if (result) {
			await this.setState({ data: result })
		}
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
		// THIS IS NOT COUNTING WITH THE YEAR
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

	openOrderItemDetails = (item) => {
		window.app.DrawerController.open("FabricInspector", Fabric.Inspector, {
			onDone: (ctx, data) => {
				ctx.close()
				// TODO: Handle if exists any updates on data
			},
			componentProps: {
				// TODO: Pass order item UUID for fetching data from API
				runnable: true, // this enable to run the fabric task inspector process
				resolvable: true, // this enable to resolve the fabric order task status
				item: item,
			}
		})
	}

	onAssignOperator = () => {
		return new Promise((resolve, reject) => {
			window.app.DrawerController.open("OperatorAssignment", UserSelector, {
				onDone: async (ctx, data) => {
					const result = await this.api.put.workloadOperators({
						_id: this.state.data._id,
						operators: data,
					}).catch((err) => {
						ctx.handleFail(err)
						return reject(err)
					})

					if (result) {
						ctx.close()
						await this.setState({ data: result })

						return resolve(result)
					}
				},
				componentProps: {
					select: { roles: ["operator"] },
					excludedIds: this.state.data.assigned,
				}
			})
		})
	}

	onRemoveOperator = async (operator) => {
		// TODO: Use modal to confirm
		return new Promise(async (resolve, reject) => {
			const result = await this.api.delete.workloadOperators({
				_id: this.state.data._id,
				operators: [operator],
			}).catch((err) => {
				console.log(err)
				return reject(err)
			})

			if (result) {
				await this.setState({ data: result })
				return resolve(result)
			}
		})
	}

	isExpired = (isFinishReached, status) => {
		if (status !== "completed" && isFinishReached) {
			return true
		}
		return false
	}

	render() {
		if (!this.state.data) {
			return <antd.Skeleton active />
		}

		const { data } = this.state

		const createdDate = new Date(data.created)
		const startReached = this.isDateReached(data.scheduledStart)
		const finishReached = this.isDateReached(data.scheduledFinish)

		const datesDiff = this.getDiffBetweenDates(data.scheduledStart, data.scheduledFinish)
		const isExpired = this.isExpired(finishReached, data.status)

		return (
			<div className={classnames("workload_details", { ["mobile"]: window.isMobile })} id={this.id} ref={this.ref} >
				<div className="workload_details header">
					<div className="workload_details header matrix">
						<antd.Tooltip placement="bottom" title="Download">
							<img onClick={this.downloadQR} src={this.state.qrCanvas?.toDataURL()} />
						</antd.Tooltip>
					</div>
					<div className="workload_details header content">
						{data.scheduledFinish ? <h1>
							<antd.Badge.Ribbon
								text={isExpired ? "expired" : `${datesDiff.daysLeft} days left`}
								color={isExpired ? "red" : undefined}
							><Icons.Box /> {data.name}

							</antd.Badge.Ribbon>
						</h1> : <h1><Icons.Box /> {data.name}</h1>}

						<div>
							<antd.Button icon={<Icons.Save />}>
								Export
							</antd.Button>
						</div>
					</div>
				</div>

				<div className="workload_details info">
					<div key="id">
						<div className="name">
							<Icons.Tag />
							ID
						</div>
						<div className="value">
							{this.id}
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
					className="workload_details list"
				>
					{data.scheduledFinish && <antd.Collapse.Panel key="scheduled" header={<h2><Icons.Calendar /> Scheduled</h2>}>
						<ScheduledProgress start={data.scheduledStart} finish={data.scheduledFinish} />
					</antd.Collapse.Panel>}

					<antd.Collapse.Panel key="timeline" header={<h2><Icons.Watch /> Timeline</h2>}>
						<antd.Timeline mode="left">
							<antd.Timeline.Item label={createdDate.toLocaleString()}>
								Workload was created
							</antd.Timeline.Item>
						</antd.Timeline>
					</antd.Collapse.Panel>

					<antd.Collapse.Panel key="operators" header={<h2><Icons.Users /> Operators</h2>}>
						<OperatorsAssignments onRemoveOperator={this.onRemoveOperator} onAssignOperator={this.onAssignOperator} assigned={data.assigned} />
					</antd.Collapse.Panel>

					<antd.Collapse.Panel key="orders" header={<h2><Icons.Archive /> Order</h2>}>
						<OrdersRender onClickItem={(item) => this.openOrderItemDetails(item)} orders={this.state.data.orders} />
					</antd.Collapse.Panel>
				</antd.Collapse>

				<div className="workload_details actions">
					<div>
						<antd.Button type="primary" icon={<Icons.MdGeneratingTokens />}>
							Add token
						</antd.Button>
					</div>
					<div>
						<antd.Button icon={<Icons.Edit />}>
							Edit
						</antd.Button>
					</div>
					<div>
						<antd.Button icon={<Icons.CheckCircle />}>
							Mark as done
						</antd.Button>
					</div>
				</div>
			</div>
		)
	}
}