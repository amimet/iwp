import React from "react"
import { Icons } from "components/Icons"

import { LoadingSpinner } from "components"
import { hasAdmin } from "core/permissions"

import { Select, Result, Button } from "antd"
const { Option } = Select

const api = window.app.apiBridge

export default class Workload extends React.Component {
	state = {
		loading: true,
		workloads: null,
		regions: [],
	}

	componentDidMount = async () => {
		await api.get
			.regions()
			.then((data) => {
				this.setState({ regions: data })
			})
			.catch((err) => {
				console.log(err)
				this.setState({ error: err })
			})
	}

	loadWorkloadsFromRegion = async (id) => {
		await api.get
			.workload(undefined, { region: id })
			.then((data) => {
				console.log(data)
				this.setState({ workloads: data, loading: false })
			})
			.catch((err) => {
				console.log(err)
				this.setState({ error: err })
			})
	}

	onChangeRegion = (regionId) => {
		this.loadWorkloadsFromRegion(regionId)
	}

	renderWorkloads() {
		if (this.state.workloads != null) {
			if (!Array.isArray(this.state.workloads)) {
				return <div>Invalid</div>
			}

			if (this.state.workloads.length === 0) {
				return <Result icon={<Icons.SmileOutlined />} title="Great, there are no more workloads" />
			}

			return <div></div>
		}

		return <LoadingSpinner />
	}

	generateRegionsOption = () => {
		return this.state.regions.map((region) => {
			return <Option value={region.id}>{region.data.name}</Option>
		})
	}

	renderAdminActions = () => {
		return (
			<div className="horizontal_actions">
				<div>
					<Button icon={<Icons.Plus />}>New Workload</Button>
				</div>
			</div>
		)
	}

	render() {
		return (
			<div>
				<div>
					<div className="horizontal_actions_cascade">
						{hasAdmin() && this.renderAdminActions()}
						<div className="horizontal_actions">
							<Select
								showSearch
								style={{ width: 200 }}
								placeholder="Select a region"
								optionFilterProp="children"
								onChange={this.onChangeRegion}
								filterOption={(input, option) =>
									option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
								}
							>
								{this.generateRegionsOption()}
							</Select>
						</div>
					</div>
				</div>
				{this.renderWorkloads()}
			</div>
		)
	}
}
