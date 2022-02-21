import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { AssignedWorkorder, Skeleton } from "components"
import { Translation } from "react-i18next"

import "./index.less"

export default class AssignedWorkorders extends React.Component {
	state = {
		loading: true,
		list: [],
	}

	api = window.app.request

	componentDidMount() {
		window.app.ws.listen("workorderAssigned", async (workorderId) => {
			const data = await this.api.get.workorder(undefined, { _id: workorderId }).catch(() => {
				return false
			})

			if (data) {
				this.appendItem(data)
			}
		})

		window.app.ws.listen("workorderUnassigned", (workorderId) => {
			this.removeItem(workorderId)
		})

		window.app.ws.listen("workorderUpdate", (update) => {
			const currentWorkorder = this.state.list.find(item => item._id === update._id)

			if (currentWorkorder) {
				if (update.finished) {
					this.removeItem(update._id)
				}
			}
		})

		this.fetchAssignedWorkorders()
	}

	appendItem = (workorder) => {
		if (Array.isArray(workorder)) {
			return this.setState({ list: [...this.state.list, ...workorder] })
		}

		return this.setState({
			list: [workorder, ...this.state.list],
		})
	}

	removeItem = (workorderId) => {
		this.setState({
			list: this.state.list.filter(item => item._id !== workorderId),
		})
	}

	onClickAssignedWorkorder = (_id) => {
		window.app.openWorkorderDetails(_id)
	}

	fetchAssignedWorkorders = async () => {
		const result = await this.api.get.assignedWorkorders().catch((err) => {
			console.error(err)
			antd.message.error("Failed to fetch assigned workorders")
			return false
		})

		if (result) {
			this.setState({
				loading: false,
				list: result,
			})
		}
	}

	renderList = () => {
		if (this.state.list.length === 0) {
			return <Translation>{
				t => t("no_assigned_workorders")
			}</Translation>
		}

		return this.state.list.map((workorder) => {
			return <div key={workorder._id}>
				<AssignedWorkorder workorder={workorder} onClick={this.onClickAssignedWorkorder} />
			</div>
		})
	}

	render() {
		return <div className="assigned">
			<h2><Icons.MdPendingActions /> <Translation>{
				t => t("assigned_for_you")
			}</Translation></h2>
			<div>
				{this.state.loading ? <Skeleton /> : this.renderList()}
			</div>
		</div>
	}
}