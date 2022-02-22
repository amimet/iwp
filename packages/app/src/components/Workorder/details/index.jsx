import React from "react"
import * as antd from "antd"
import { Translation } from "react-i18next"
import classnames from "classnames"
import moment from "moment"
import QRCode from "qrcode"

import { User } from "models"
import { Icons } from "components/Icons"
import { Skeleton, ActionsBar, OperatorsAssignments } from "components"

import { PayloadsRender, PayloadInspector, WorkorderResult } from ".."
import "./index.less"

const dateFormat = "DD-MM-YYYY hh:mm"

const OperatorsAssignmentsWrapper = (props) => {
	return <div>
		<h1>
			<Icons.Users />
			<Translation>
				{t => t("Assigned operators")}
			</Translation>
		</h1>

		<OperatorsAssignments {...props} />
	</div>
}

const StatementSelector = (props) => {
	const statements = ["archived", "finished", "pending", "started", "expired",]

	return <div>
		<Translation>
			{t => t("Select a statement to add to the workorder")}
		</Translation>

		<antd.Select
			{...props}
		>
			{statements.map(statement => {
				return <antd.Select.Option key={statement}>
					{statement}
				</antd.Select.Option>
			})}
		</antd.Select>
	</div>
}

export default class WorkorderDetails extends React.Component {
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

		this.selfUserId = await User.selfUserId()

		const qr = await this.createQR()
		await this.fetchData()

		await this.setState({ qrCanvas: qr, hasManager: await User.hasRole("manager") })

		window.app.ws.listen(`workorderUpdate_${this.id}`, (data) => {
			this.setState({ data: data })
		})
	}

	fetchData = async () => {
		await this.setState({ data: null })

		const result = await this.api.get.workorder(undefined, { _id: this.id }).catch((err) => {
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
				workorderId: this.id,
				payload: payloadData,
			}
		})
	}

	openModify = () => {
		window.app.openWorkorderCreator(this.id, (result) => {
			this.fetchData()
			// console.log(result)
			// if (result) {
			// 	this.setState({ data: result })
			// }
		})
	}

	openOperatorSelector = () => {
		window.app.DrawerController.open("OperatorSelector", OperatorsAssignmentsWrapper, {
			componentProps: {
				onAssignOperators: (operators) => {
					this.onAssignOperator(operators)
				},
				onRemoveOperator: (operator) => {
					this.onRemoveOperator(operator)
				},
				assigned: this.state.data.assigned,
			}
		})
	}

	openStatementSelector = () => {
		antd.Modal.confirm({
			title: <Translation>
				{t => t("Select a statement")}
			</Translation>,
			content: <StatementSelector
				onChange={(value) => {
					this.onUpdateStatement(value)
				}}
			/>

		})
	}

	handleStatementMenuClick = (e) => {
		this.onUpdateStatement(e.key)
	}

	onUpdateStatement = async (statement) => {
		const result = await this.api.put.updateWorkorder({
			_id: this.id,
			update: {
				status: statement,
			}
		}).catch((err) => {
			return false
		})

		if (result) {
			ctx.unselectAll()
		}

		return result
	}

	onAssignOperator = async (data) => {
		const result = await this.api.put.workorderOperators({
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
			const result = await this.api.delete.workorderOperators({
				_id: this.state.data._id,
				operators: [operator],
			}).catch((err) => {
				console.error(err)
				return reject(err)
			})

			if (result) {
				await this.setState({ data: result })
				return resolve(result)
			}
		})
	}

	onExportWorkorder = async () => {
		window.app.DrawerController.open("WorkorderResult", WorkorderResult, {
			onDone: (ctx, data) => {
				ctx.close()
			},
			componentProps: {
				id: this.id,
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
			return <Skeleton />
		}

		const { data } = this.state

		const createdDate = new Date(data.created)
		const startReached = this.isDateReached(data.scheduledStart)
		const finishReached = this.isDateReached(data.scheduledFinish)

		const datesDiff = this.getDiffBetweenDates(data.scheduledStart, data.scheduledFinish)
		const isExpired = this.isExpired(finishReached, data.status)

		const StatementMenu = <antd.Menu
			selectedKeys={[data.status]}
			onClick={this.handleStatementMenuClick}
		>
			{["Archived", "Finished", "Pending", "Started", "Expired",].map(statement => {
				return <antd.Menu.Item key={statement.toLowerCase()}>
					<Translation>
						{t => t(statement)}
					</Translation>
				</antd.Menu.Item>
			})}
		</antd.Menu>

		return (
			<div className={classnames("workorder_details", { ["mobile"]: window.isMobile })} id={this.id} ref={this.ref} >
				<div className="workorder_details header">
					{this.state.hasManager && <div className="workorder_details header matrix">
						<antd.Tooltip placement="bottom" title="Download">
							<img onClick={this.downloadQR} src={this.state.qrCanvas?.toDataURL()} />
						</antd.Tooltip>
					</div>}
					<div className="workorder_details header content">
						{data.scheduledFinish || data.finished ? <h1>
							<antd.Badge.Ribbon
								text={
									<Translation>
										{t => data.finished ? t("Finished") : (isExpired ? t("expired") : `${datesDiff.daysLeft} ${t("days left")}`)}
									</Translation>
								}
								color={isExpired ? "red" : undefined}
							><Icons.Box /> {data.name}

							</antd.Badge.Ribbon>
						</h1> :
							<h1>
								<Icons.Box /> {data.name}
							</h1>}
					</div>
				</div>

				<div className="workorder_details info">
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
					<div key="assignments">
						<div className="name">
							<Icons.Users />
							<Translation>
								{t => t("Assignments")}
							</Translation>
						</div>
						<div className="value">
							{data.assigned?.length}
						</div>
					</div>
				</div>

				{this.state.hasManager && <ActionsBar spaced padding="8px">
					<div>
						<antd.Button
							icon={<Icons.Edit />}
							onClick={this.openModify}
						>
							<Translation>
								{t => t("Modify")}
							</Translation>
						</antd.Button>
					</div>
					<div>
						<antd.Button
							icon={<Icons.Users />}
							onClick={this.openOperatorSelector}
						>
							<Translation>
								{t => t("Operators")}
							</Translation>
						</antd.Button>
					</div>
					<div>
						<antd.Dropdown
							overlay={StatementMenu}
							trigger={["click"]}
						>
							<antd.Button
								icon={<Icons.Eye />}
							>
								<Translation>
									{t => t("Status")}
								</Translation>
							</antd.Button>
						</antd.Dropdown>
					</div>
					<div>
						<antd.Button
							icon={<Icons.MdSaveAlt />}
							onClick={this.onExportWorkorder}
						>
							<Translation>
								{t => t("Export")}
							</Translation>
						</antd.Button>
					</div>
				</ActionsBar>}

				<div className="workorder_details payloads">
					<div className="header">
						<div>
							<h1>
								<Icons.Inbox />
								<Translation>
									{t => t("Workloads")}
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
							selfUserId={this.selfUserId}
							onClickItem={(item) => this.openPayloadDetails(item)}
							payloads={this.state.data.payloads}
						/>
					</div>
				</div>
			</div>
		)
	}
}