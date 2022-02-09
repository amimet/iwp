import React from "react"
import * as antd from "antd"
import { PullToRefresh } from "antd-mobile"
import { Translation } from "react-i18next"
import moment from "moment"
import classnames from "classnames"
import { debounce } from "lodash"
import fuse from "fuse.js"

import { Icons } from "components/Icons"
import { ActionsBar, SelectableList, SearchButton, Skeleton } from "components"

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

export default class Workorders extends React.Component {
	state = {
		loading: true,
		sections: [],
		viewFinished: false,
		selectedSection: "all",
		searchValue: null,
		workorders: null,
	}

	api = window.app.request

	componentDidMount = async () => {
		window.app.handleWSListener("newWorkorder", (data) => {
			this.appendWorkorderToRender(data)
		})

		window.app.handleWSListener("workorderUpdate", (data) => {
			let workorders = this.state.workorders

			workorders = workorders.map((workorder) => {
				if (workorder.id === data.id) {
					return data
				}

				return workorder
			})

			this.setState({ workorders })
		})

		this.loadSections()
		this.fetchWorkorders(this.state.selectedSection)
	}

	fetchWorkorders = async (sectionId, viewFinished) => {
		sectionId = sectionId ?? this.state.selectedSection
		viewFinished = viewFinished ?? this.state.viewFinished

		await this.setState({ loading: true })

		const data = await this.api.get.workorder(undefined, {
			section: sectionId,
			finished: this.state.viewFinished,
		}).catch((err) => {
			console.log(err)
			return false
		})

		if (data) {
			this.setState({
				loading: false,
				workorders: data,
			})
		}
	}

	loadSections = async () => {
		await this.api.get.sections()
			.then((data) => {
				this.setState({ sections: data })
			})
			.catch((error) => {
				console.error(error)
				this.setState({ error })
			})
	}

	appendWorkorderToRender = (payload) => {
		let query = []
		let workorders = this.state.workorders ?? []

		if (Array.isArray(payload)) {
			query = payload
		} else {
			query.push(payload)
		}

		query.forEach((_payload) => {
			workorders.push(_payload)
		})

		this.setState({ workorders })
	}

	deleteWorkorderFromRender = (id) => {
		let query = []
		let workorders = this.state.workorders

		if (Array.isArray(id)) {
			query = id
		} else {
			query.push(id)
		}

		workorders = workorders.filter((workorder) => !id.includes(workorder._id))

		this.setState({ workorders })
	}

	changeSection = (section) => {
		this.setState({ selectedSection: section }, async () => {
			await this.fetchWorkorders(section)
		})
	}

	onDeleteWorkorders = (ctx, keys) => {
		antd.Modal.confirm({
			title: <Translation>
				{t => t("Do you want to delete these items?")}
			</Translation>,
			icon: <Icons.ExclamationCircleOutlined />,
			content: keys.map((key) => {
				return <div>{key}</div>
			}),
			onOk: () => {
				return new Promise((resolve, reject) => {
					this.api.delete
						.workorder({ id: keys })
						.then(() => {
							ctx.unselectAll()
							this.deleteWorkorderFromRender(keys)
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
		window.app.openWorkorderDetails(key)
	}

	onSearch = (value) => {
		if (value === "" && this.state.searchValue) {
			return this.setState({ searchValue: null })
		}

		this.debouncedSearch(value)
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

		const searcher = new fuse(this.state.workorders, {
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

	renderSectionsOptions = () => {
		return this.state.sections.map((section) => {
			return (
				<antd.Select.Option key={section.name} value={section.name}>
					{section.name}
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
			<div className="workorder_item">
				<div className="header">
					<div className={classnames("indicator", indicatorStatus)}>
						<div className="statusText">
							<Translation>
								{t => t(indicatorStatus)}
							</Translation>
						</div>
					</div>
					<div>
						<antd.Tag>{String(item._id).toUpperCase()}</antd.Tag>
					</div>
				</div>
				<div>
					<h1>{item.name ?? "Unnamed workorder"}</h1>
				</div>
				<div className="info">
					{renderDate(item.created)}
					<div>
						<Icons.Box />
						<Translation>
							{t => `${item.payloads?.length ?? 0} ${t("payloads")}`}
						</Translation>
					</div>
				</div>
			</div>
		)
	}

	renderWorkorders = (list) => {
		const actions = []

		// TODO: Fetch user permissions and check if user has permission to delete
		actions.push(
			<div key="delete" call="onDelete">
				<Icons.Trash />
				<Translation>
					{t => t("Delete")}
				</Translation>
			</div>,
		)

		if (list.length === 0) {
			return <antd.Result
				icon={<Icons.SmileOutlined />}
				// TODO: Add translation
				title="Great, there are no more workorders"
			/>
		}

		return <SelectableList
			items={list}
			actions={actions}
			onDoubleClick={this.onDoubleClickItem}
			events={{
				onDelete: this.onDeleteWorkorders,
			}}
			renderItem={this.renderItem}
		/>
	}

	render() {
		return (
			<div className="workorders_list" style={{ height: "100%" }}>
				<div style={{ marginBottom: "10px" }}>
					<ActionsBar mode="float">
						<div key="search">
							<SearchButton
								onSearch={this.onSearch}
								onChange={this.onSearch}
							/>
						</div>
						<div>
							<span>
								<Translation>
									{t => t("View finished")}
								</Translation>
							</span>
							<antd.Switch
								value={this.state.viewFinished}
								onChange={() => {
									this.setState({ viewFinished: !this.state.viewFinished }, () => {
										this.fetchWorkorders()
									})
								}}
							/>
						</div>
						<div key="sectionSelection">
							<antd.Select
								key="section_select"
								showSearch
								style={{ width: 200 }}
								placeholder="Select a section"
								optionFilterProp="children"
								onChange={this.changeSection}
								value={this.state.selectedSection}
								filterOption={(input, option) =>
									option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
								}
							>
								<antd.Select.Option key="all" value="all">
									<Translation>
										{t => t("All")}
									</Translation>
								</antd.Select.Option>
								{this.renderSectionsOptions()}
							</antd.Select>
						</div>
					</ActionsBar>
				</div>
				<PullToRefresh
					renderText={status => {
						return <div>
							{statusRecord[status]}
						</div>
					}}
					onRefresh={async () => await this.fetchWorkorders(this.state.selectedSection)}
				>
					{this.state.loading ? <Skeleton /> : this.renderWorkorders(this.state.searchValue ?? this.state.workorders)}
				</PullToRefresh>
			</div>
		)
	}
}