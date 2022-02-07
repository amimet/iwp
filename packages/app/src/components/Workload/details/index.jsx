import React from "react"
import * as antd from "antd"
import { User } from "models"
import { Translation } from "react-i18next"
import classnames from "classnames"
import moment from "moment"
import QRCode from "qrcode"

import { Icons } from "components/Icons"

import { PayloadsRender, PayloadInspector } from ".."
import "./index.less"

const dateFormat = "DD-MM-YYYY hh:mm"

export default class WorkloadDetails extends React.Component {
	state = {
		hasManager: false,
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

		await this.setState({ qrCanvas: qr, hasManager: await User.hasRole("manager") })

		window.app.handleWSListener(`workloadUpdate_${this.id}`, (data) => {
			this.setState({ data: data })
		})
	}

	fetchData = async () => {
		await this.setState({ data: null })

		const result = await this.api.get.workload(undefined, { _id: this.id }).catch((err) => {
			antd.message.error(err)
			console.error(err)
			return false
		})

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

	openPayloadDetails = (item) => {
		const payloadData = this.state.data.payloads.find((payload) => payload.uuid === item.uuid)

		window.app.DrawerController.open("PayloadInspector", PayloadInspector, {
			onDone: (ctx, data) => {
				ctx.close()
			},
			componentProps: {
				workloadId: this.id,
				payload: payloadData,
			}
		})
	}

	onAssignOperator = async (data) => {
		const result = await this.api.put.workloadOperators({
			_id: this.state.data._id,
			operators: data,
		}).catch((err) => {
			antd.message.error(err)
			console.error(err)
			return false
		})

		if (result) {
			await this.setState({ data: result })
		}
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
								text={
									<Translation>
										{t => isExpired ? t("expired") : `${datesDiff.daysLeft} ${t("days left")}`}
									</Translation>
								}
								color={isExpired ? "red" : undefined}
							><Icons.Box /> {data.name}

							</antd.Badge.Ribbon>
						</h1> : <h1><Icons.Box /> {data.name}</h1>}
					</div>

				</div>

				<div className="workload_details info">
					<div key="id">
						<div className="name">
							<Icons.Tag />
							ID
						</div>
						<div className="value">
							{String(this.id).toUpperCase()}
						</div>
					</div>
					<div key="state">
						<div className="name">
							<Icons.Activity />
							<Translation>
								{t => t("State")}
							</Translation>
						</div>
						<div className="value">
							<Translation>
								{t => t(data.status)}
							</Translation>
						</div>
					</div>
					<div key="commits">
						<div className="name">
							<Icons.Database />
							<Translation>
								{t => t("Commits")}
							</Translation>
						</div>
						<div className="value">
							{data.commits?.length}
						</div>
					</div>
				</div>

				{this.state.hasManager && <div className="manager_actions">
					<div>
						<antd.Button icon={<Icons.Edit />}>
							<Translation>
								{t => t("Modify")}
							</Translation>
						</antd.Button>
					</div>
					<div>
						<antd.Button icon={<Icons.Users />}>
							<Translation>
								{t => t("Manage operators")}
							</Translation>
						</antd.Button>
					</div>
				</div>}

				<div className="workload_details payloads">
					<div className="header">
						<div>
							<h1>
								<Icons.Inbox />
								<Translation>
									{t => t("Payloads")}
								</Translation>
							</h1>
						</div>
						<div>
							<antd.Button type="primary" icon={<Icons.MdGeneratingTokens />}>
								<Translation>
									{t => t("Add commit")}
								</Translation>
							</antd.Button>
						</div>
					</div>
					<div className="content">
						<PayloadsRender
							onClickItem={(item) => this.openPayloadDetails(item)}
							payloads={this.state.data.payloads}
						/>
					</div>
				</div>
			</div>
		)
	}
}