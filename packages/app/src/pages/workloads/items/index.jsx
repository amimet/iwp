import React from "react"
import * as antd from "antd"
import fuse from "fuse.js"

import "./index.less"

const api = window.app.apiBridge

export default class WorkloadsItems extends React.Component {
	state = {
		items: [],
		searchValue: null,
	}

	componentDidMount = async () => {
		const items = await api.get.fabricitems().catch((error) => {
			console.error(error)
			return []
		})
		this.setState({ items })
	}

	onSearch = (value) => {
		if (typeof value !== "string") {
			if (typeof value.target?.value === "string") {
				value = value.target.value
			}
		}

		if (value === "") {
			return this.setState({ searchValue: null })
		}

		const searcher = new fuse(this.state.items, {
			includeScore: true,
			keys: ["title", "id", "name", "_id"],
		})
		const result = searcher.search(value)

		this.setState({
			searchValue: result.map((entry) => {
				return entry.item
			}),
		})
	}

	renderItem = (item) => {
		return (
			<antd.List.Item
				className="workload_fabric_item"
				key={item.title}
				extra={<img width={272} alt="item_view" src={item.img} />}
			>
				<antd.List.Item.Meta title={item.title} description={item.description} />
			</antd.List.Item>
		)
	}

	render() {
		return (
			<div className="wrapper">
				<div>
					<antd.Input.Search
						placeholder="Search"
						allowClear
						onSearch={this.onSearch}
						onChange={this.onSearch}
					/>
				</div>
				<div>
					<antd.List
						itemLayout="vertical"
						size="large"
						pagination={{
							onChange: (page) => {
								console.log(page)
							},
							pageSize: 3,
						}}
						renderItem={this.renderItem}
						dataSource={this.state.searchValue ?? this.state.items}
					/>
				</div>
			</div>
		)
	}
}
