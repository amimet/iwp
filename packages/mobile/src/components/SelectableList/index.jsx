import React from "react"
import { Icons } from "components/Icons"
import { ActionsBar } from "components"
import { Button } from "antd"
import classnames from "classnames"
import { useLongPress } from "utils"

import "./index.less"

const ListItem = React.memo((props) => {
	let { item } = props

	if (item.children) {
		return <div className="selectableList_group">
			{item.label}
			<div className="selectableList_subItems">
				{item.children.map((subItem) => {
					return <ListItem item={subItem} />
				})}
			</div>
		</div>
	}

	const renderChildren = props.renderChildren(item)
	const isDisabled = renderChildren.props.disabled

	return React.createElement("div", {
		id: props.id,
		key: props.id,
		disabled: isDisabled,
		className: classnames("item", {
			["selected"]: props.selected,
			["disabled"]: isDisabled,
		}),
		...useLongPress(
			() => {
				if (isDisabled) {
					return false
				}
				props.onLongPressItem(props.id)
			},
			() => {
				if (isDisabled) {
					return false
				}
				props.onClickItem(props.id)
			},
			{
				shouldPreventDefault: true,
				delay: 500,
			}
		)

	}, renderChildren)
})

export default class SelectableList extends React.Component {
	state = {
		selectedKeys: [],
		selectionEnabled: false,
	}

	componentDidMount() {
		if (typeof this.props.defaultSelected !== "undefined" && Array.isArray(this.props.defaultSelected)) {
			this.setState({
				selectedKeys: [...this.props.defaultSelected],
			})
		}
	}

	isKeySelected = (key) => {
		return this.state.selectedKeys.includes(key)
	}

	selectAll = () => {
		if (this.props.items.length > 0) {
			this.setState({
				selectedKeys: [...this.props.items.map((item) => item.key ?? item.id ?? item._id)],
			})
		}
	}

	unselectAll = () => {
		this.setState({
			selectedKeys: [],
		})
	}

	selectKey = (key) => {
		let list = this.state.selectedKeys ?? []
		list.push(key)
		return this.setState({ selectedKeys: list })
	}

	unselectKey = (key) => {
		let list = this.state.selectedKeys ?? []
		list = list.filter((_key) => key !== _key)
		return this.setState({ selectedKeys: list })
	}

	onDone = () => {
		if (typeof this.props.onDone === "function") {
			this.props.onDone(this.state.selectedKeys)
		}
		this.unselectAll()
	}

	onDiscard = () => {
		if (typeof this.props.onDiscard === "function") {
			this.props.onDiscard(this.state.selectedKeys)
		}
		this.unselectAll()
	}

	onClickItem = (key) => {
		if (this.state.selectionEnabled) {
			if (this.isKeySelected(key)) {
				this.unselectKey(key)
			} else {
				this.selectKey(key)
			}
		}
	}

	onLongPressItem = (key) => {
		if (!this.state.selectionEnabled) {
			this.selectKey(key)
			this.setState({ selectionEnabled: true })
		}
	}

	renderProvidedActions = () => {
		return this.props.actions.map((action) => {
			return (
				<div key={action.key}>
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

	render() {
		if (this.state.selectionEnabled && this.state.selectedKeys.length === 0) {
			this.setState({ selectionEnabled: false })
			this.unselectAll()
		}

		let items = this.props.items.map((item, index) => {
			item.key = item.key ?? item.id ?? item._id

			let selected = this.isKeySelected(item.key)

			return <ListItem
				item={item}
				key={item.key}
				id={item.key}
				selected={selected}
				onClickItem={this.onClickItem}
				onLongPressItem={this.onLongPressItem}
				renderChildren={this.props.renderItem}
			/>
		})

		return <div className={classnames("selectableList", { ["selectionEnabled"]: this.state.selectionEnabled })}>
			<div className="content">
				{items}
			</div>
			{this.state.selectionEnabled && !this.props.actionsDisabled &&
				<ActionsBar mode="float">
					<div key="discard">
						<Button
							shape="round"
							onClick={this.onDiscard}
							{...this.props.onDiscardProps}
						>
							{this.props.onDiscardRender ?? <Icons.X />}
							Discard
						</Button>
					</div>
					<div key="allSelection">

						<Button
							shape="round"
							onClick={this.selectAll}
						>All</Button>
					</div>
					{Array.isArray(this.props.actions) && this.renderProvidedActions()}
				</ActionsBar>
			}
		</div>
	}
}