import React from "react"

import { Icons } from "components/Icons"
import { ActionsBar } from "components"
import { List, Button } from "antd"
import classnames from "classnames"

import "./index.less"

export default class SelectableList extends React.Component {
	state = {
		data: [],
		selectedKeys: [],
	}

	componentDidMount() {
		if (typeof this.props.defaultSelected !== "undefined" && Array.isArray(this.props.defaultSelected)) {
			this.setState({
				selectedKeys: [...this.props.defaultSelected],
			})
		}

		if (typeof this.props.data !== "undefined" && Array.isArray(this.props.data)) {
			this.setState({
				data: [...this.props.data],
			})
		}

		if (typeof this.props.children !== "undefined") {
			let childrenItems = []

			if (!Array.isArray(this.props.children)) {
				childrenItems.push(this.props.children)
			} else {
				childrenItems = this.props.children
			}

			this.setState({
				data: [
					...this.state.data,
					...childrenItems.map((item) => {
						return { key: item.key, render: item }
					}),
				],
			})
		}
	}

	onClickKey = (key) => {
		if (typeof this.props.selectionEnabled !== "undefined") {
			if (!Boolean(this.props.selectionEnabled)) {
				return false
			}
		}

		let list = this.state.selectedKeys ?? []

		if (!list.includes(key)) {
			list.push(key)
		} else {
			list = list.filter((_key) => key !== _key)
		}

		return this.setState({ selectedKeys: list })
	}

	onDone = () => {
		if (typeof this.props.onDone === "function") {
			this.props.onDone(this.state.selectedKeys)
		}
	}

	onDiscard = () => {
		if (typeof this.props.onDiscard === "function") {
			this.props.onDiscard(this.state.selectedKeys)
		}

		this.setState({
			selectedKeys: [],
		})
	}

	renderActions = () => {
		if (typeof this.props.renderActions !== "undefined" && !this.props.renderActions) {
			return false
		}
		if (this.state.selectedKeys.length === 0) {
			return false
		}

		const renderExtraActions = () => {
			if (Array.isArray(this.props.actions)) {
				return this.props.actions.map((action) => {
					return (
						<div>
							<Button
								style={{
									...action.props.style,
								}}
								onClick={() => {
									if (typeof action.onClick === "function") {
										action.onClick(this.state.selectedKeys)
									}

									if (typeof this.props[action.props.call] !== "undefined") {
										if (typeof this.props[action.props.call] === "function") {
											let data = this.state.selectedKeys // by default send selectedKeys

											if (typeof action.props.sendData === "string") {
											}
											{
												switch (action.props.sendData) {
													case "keys": {
														data = this.state.selectedKeys
													}
													default: {
														data = this.state.selectedKeys
													}
												}
											}

											this.props[action.props.call](data)
										}
									}
								}}
							>
								{action}
							</Button>
						</div>
					)
				})
			}
			return null
		}

		return (
			<div className="bottomActions_wrapper">
				<ActionsBar style={{ borderRadius: "8px 8px 0 0", width: "fit-content" }}>
					<div>
						<Button
							style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
							shape="circle"
							onClick={this.onDiscard}
							{...this.props.onDiscardProps}
						>
							{this.props.onDiscardRender ?? <Icons.X style={{ margin: 0, padding: 0 }} />}
						</Button>
					</div>
					<div>
						<Button type="primary" onClick={this.onDone} {...this.props.onDoneProps}>
							{this.props.onDoneRender ?? (
								<>
									<Icons.Check /> Done
								</>
							)}
						</Button>
					</div>

					{renderExtraActions()}
				</ActionsBar>
			</div>
		)
	}

	render() {
		const renderMethod = (item) => {
			return (
				<div
					key={item.key}
					onClick={() => this.onClickKey(item.key)}
					className={classnames("selectableList_item", {
						selection: this.state.selectionEnabled,
						selected: this.state.selectedKeys.includes(item.key),
					})}
				>
					{typeof this.props.renderItem === "function"
						? this.props.renderItem(item)
						: React.cloneElement(item.render)}
				</div>
			)
		}
		const { borderer, grid, header, loadMore, locale, pagination, rowKey, size, split, itemLayout, loading } = this.props
		const listProps = { borderer, grid, header, loadMore, locale, pagination, rowKey, size, split, itemLayout, loading }

		return (
			<div>
				{this.renderActions()}
				<List {...listProps} dataSource={this.state.data} renderItem={renderMethod} />
			</div>
		)
	}
}
