import React from "react"
import * as antd from "antd"
import { Icons } from "components/Icons"
import { AssignedWorkload } from "components"
import { Translation } from "react-i18next"

import "./index.less"

export default class AssignedWorkloads extends React.Component {
	state = {
		loading: true,
		list: [],
	}

	api = window.app.request

	componentDidMount() {
		window.app.handleWSListener("workloadAssigned", async (workloadId) => {
			const data = await this.api.get.workload(undefined, { _id: workloadId }).catch(() => {
				return false
			})

			if (data) {
				this.appendItem(data)
			}
		})

		window.app.handleWSListener("workloadUnassigned", (workloadId) => {
			this.removeItem(workloadId)
		})

		window.app.handleWSListener("workloadUpdate", (update) => {
			this.fetchAssignedWorkloads()

			// this.setState({
			// 	list: this.state.list.map((item) => {
			// 		if (item._id === update._id) {
			// 			return update
			// 		}

			// 		return item
			// 	})
			// })
		})

		this.fetchAssignedWorkloads()
	}

	appendItem = (workload) => {
		if (Array.isArray(workload)) {
			return this.setState({ list: [...this.state.list, ...workload] })
		}

		return this.setState({
			list: [workload, ...this.state.list],
		})
	}

	removeItem = (workloadId) => {
		this.setState({
			list: this.state.list.filter(item => item._id !== workloadId),
		})
	}

	onClickAssignedWorkload = (_id) => {
		window.app.openWorkloadDetails(_id)
	}

	fetchAssignedWorkloads = async () => {
		const result = await this.api.get.assignedWorkloads().catch((err) => {
			console.error(err)
			antd.message.error("Failed to fetch assigned workloads")
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
				t => t("no_assigned_workloads")
			}</Translation>
		}

		return this.state.list.map((workload) => {
			return <div key={workload._id}>
				<AssignedWorkload workload={workload} onClick={this.onClickAssignedWorkload} />
			</div>
		})
	}

	render() {
		return <div className="assigned">
			<h2><Icons.MdPendingActions /> <Translation>{
				t => t("assigned_for_you")
			}</Translation></h2>
			<div>
				{this.state.loading ? <antd.Skeleton active /> : this.renderList()}
			</div>
		</div>
	}
}