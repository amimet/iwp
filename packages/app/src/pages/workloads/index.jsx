import React from "react"
import * as antd from "antd"
import { PullToRefresh } from "antd-mobile"
import moment from "moment"
import classnames from "classnames"
import { debounce } from "lodash"
import fuse from "fuse.js"

import { Icons } from "components/Icons"
import { ActionsBar, SelectableList } from "components"

import "./index.less"

const dateFormat = "DD-MM-YYYY hh:mm"

const statusRecord = {
	pulling: "Slide down to refresh",
	canRelease: "Release",
	refreshing: <Icons.LoadingOutlined spin />,
	complete: <Icons.Check />,
}

const renderDate = (time) => {
	const dateNumber = Number(time)

	if (dateNumber) {
		const date = new Date(dateNumber)
		return [
			<div>
				<Icons.Clock /> {date.toLocaleTimeString()}
			</div>,
			<div>
				<Icons.Calendar /> {date.toLocaleDateString()}
			</div>,
		]
	}
	return (
		<div>
			<div>
				<Icons.Clock /> {time}
			</div>
		</div>
	)
}

export default class Workloads extends React.Component {
	state = {
		loading: true,
		regions: [],
		selectionEnabled: false,
		selectedRegion: "all",
		searchValue: null,
		workloads: null,
	}

	api = window.app.request

	componentDidMount = async () => {
		window.app.handleWSListener("newWorkload", (data) => {
			this.appendWorkloadToRender(data)
		})

		this.loadRegions()
		this.fetchWorkloadsFromRegion(this.state.selectedRegion)
	}

	fetchWorkloadsFromRegion = async (id) => {
		this.setState({ loading: true })

		await this.api.get.workload(undefined, { region: id })
			.then((data) => {
				console.log(data)
				this.setState({ workloads: data, loading: false })
			})
			.catch((err) => {
				console.log(err)
				this.setState({ error: err, loading: false })
			})
	}

	loadRegions = async () => {
		await this.api.get.regions()
			.then((data) => {
				this.setState({ regions: data })
			})
			.catch((error) => {
				console.error(error)
				this.setState({ error })
			})
	}

	appendWorkloadToRender = (payload) => {
		let query = []
		let workloads = this.state.workloads ?? []

		if (Array.isArray(payload)) {
			query = payload
		} else {
			query.push(payload)
		}

		query.forEach((_payload) => {
			workloads.push(_payload)
		})

		this.setState({ workloads })
	}

	deleteWorkloadFromRender = (id) => {
		let query = []
		let workloads = this.state.workloads

		if (Array.isArray(id)) {
			query = id
		} else {
			query.push(id)
		}

		workloads = workloads.filter((workload) => !id.includes(workload._id))

		this.setState({ workloads })
	}

	changeRegion = (region) => {
		this.setState({ selectedRegion: region }, async () => {
			await this.fetchWorkloadsFromRegion(region)
		})
	}

	onDeleteWorkloads = (ctx, keys) => {
		antd.Modal.confirm({
			title: "Do you want to delete these items?",
			icon: <Icons.ExclamationCircleOutlined />,
			content: keys.map((key) => {
				return <div>{key}</div>
			}),
			onOk: () => {
				return new Promise((resolve, reject) => {
					this.api.delete
						.workload({ id: keys })
						.then(() => {
							ctx.unselectAll()
							this.deleteWorkloadFromRender(keys)
							return resolve()
						})
						.catch((err) => {
							return reject(err)
						})
				})
			},
		})
	}

	onDoubleClickItem = (key) => {
		window.app.openWorkloadDetails(key)
	}

	onSearch = (event) => {
		if (event === "" && this.state.searchValue) {
			return this.setState({ searchValue: null })
		}

		this.debouncedSearch(event.target.value)
	}

	search = (value) => {
		if (typeof value !== "string") {
			if (typeof value.target?.value === "string") {
				value = value.target.value
			}
		}

		if (value === "") {
			return this.setState({ searchValue: null })
		}

		const searcher = new fuse(this.state.workloads, {
			includeScore: true,
			keys: ["name", "_id"],
		})
		const result = searcher.search(value)

		this.setState({
			searchValue: result.map((entry) => {
				return entry.item
			}),
		})
	}

	debouncedSearch = debounce((value) => this.search(value), 500)

	renderRegionsOptions = () => {
		return this.state.regions.map((region) => {
			return (
				<antd.Select.Option key={region.name} value={region.name}>
					{region.name}
				</antd.Select.Option>
			)
		})
	}

	renderItem = (item) => {
		if (typeof item.scheduledFinish !== "undefined") {
			const now = moment().format(dateFormat)

			const isExpired = moment(item.scheduledFinish, dateFormat).isBefore(moment(now, dateFormat))

			if (isExpired) {
				item.expired = true
			}
		}

		const indicatorStatus = item.expired ? "expired" : item.status

		return (
			<div className="workload_order_item">
				<div className="header">
					<div className={classnames("indicator", indicatorStatus)}>
						<div className="statusText">{indicatorStatus}</div>
					</div>
					<div>
						<h1>{item.name ?? "Unnamed workload"}</h1>
					</div>
					<div>
						<antd.Tag>{String(item._id).toUpperCase()}</antd.Tag>
					</div>
				</div>
				<div className="info">
					{renderDate(item.created)}
					<div>
						<Icons.Box />
						{item.payloads?.length ?? 0} payloads
					</div>
				</div>
			</div>
		)
	}

	renderWorkloads = (list) => {
		const actions = []

		// TODO: Fetch user permissions and check if user has permission to delete
		actions.push(
			<div key="delete" call="onDelete">
				<Icons.Trash />
				Delete
			</div>,
		)

		if (list.length === 0) {
			return <antd.Result icon={<Icons.SmileOutlined />} title="Great, there are no more workloads" />
		}

		return <SelectableList
			items={list}
			actions={actions}
			onDoubleClick={this.onDoubleClickItem}
			onDelete={this.onDeleteWorkloads}
			renderItem={this.renderItem}
		/>
	}

	render() {
		return (
			<div className="workloads_list" style={{ height: "100%" }}>
				<div style={{ marginBottom: "10px" }}>
					<ActionsBar mode="float">
						<div key="search">
							<antd.Input.Search
								placeholder="Search"
								allowClear
								onSearch={this.onSearch}
								onChange={this.onSearch}
							/>
						</div>
						<div key="regionSelection">
							<antd.Select
								key="region_select"
								showSearch
								style={{ width: 200 }}
								placeholder="Select a region"
								optionFilterProp="children"
								onChange={this.changeRegion}
								value={this.state.selectedRegion}
								filterOption={(input, option) =>
									option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
								}
							>
								<antd.Select.Option key="all" value="all">
									All regions
								</antd.Select.Option>
								{this.renderRegionsOptions()}
							</antd.Select>
						</div>
					</ActionsBar>
				</div>
				<PullToRefresh
					renderText={status => {
						return <div>{statusRecord[status]}</div>
					}}
					onRefresh={async () => await this.fetchWorkloadsFromRegion(this.state.selectedRegion)}
				>
					{this.state.loading ? <antd.Skeleton active /> : this.renderWorkloads(this.state.searchValue ?? this.state.workloads)}
				</PullToRefresh>
			</div>
		)
	}
}