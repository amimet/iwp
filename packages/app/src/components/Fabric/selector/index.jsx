import React from "react"
import * as antd from "antd"
import { Stepper } from "antd-mobile"
import { Icons, createIconRender } from "components/Icons"
import { Fabric } from "components"

import FORMULAS from "schemas/fabricFormulas"
import "./index.less"

// TODO: Override with custom properties
export default class BrowserSelector extends React.Component {
	state = {
		error: false,
		loading: true,
		items: [],

		selectedItem: false,
		selectedVariants: null,
		quantity: 1,

		createCustom: false,
	}

	api = window.app.request

	componentDidMount = async () => {
		this.fetchItems()
	}

	parseFabricObjectsAsGroups = (objects) => {
		objects = objects.reduce((acc, obj) => {
			if (typeof acc[obj.type] !== "object") {
				acc[obj.type] = []
			}

			acc[obj.type].push(obj)

			return acc
		}, {})

		// return as array
		return Object.keys(objects).map((type) => {
			return {
				type,
				items: objects[type],
			}
		})
	}

	fetchItems = async () => {
		const data = await this.api.get.fabric(undefined, { select: { type: ["product", "operation", "task"] } }).catch((err) => {
			console.error(err)
			return false
		})

		if (data) {
			this.setState({ items: data, loading: false })
		}
	}

	onClickCreateCustom = () => {
		this.setState({ createCustom: true })
	}

	handleDone = () => {
		if (typeof this.props.handleDone === "function") {
			let item = {
				...this.state.selectedItem,
				["properties"]: {
					...this.state.selectedItem.properties,
					// Override with custom properties
					["quantity"]: this.state.quantity,
					["variants"]: this.state.selectedVariants,
				},
			}

			this.props.handleDone(item)
		}
	}

	handleSelectItem = (item) => {
		this.setState({ selectedItem: item })
	}

	handleSelectBack = () => {
		this.setState({ selectedItem: false })
	}

	handleSelectVariant = (values) => {
		this.setState({ selectedVariants: values })
	}

	//TODO: Split as `bruhSomething` component
	renderSelectedItem = (item) => {
		return <div className="fabric_selector inspector">
			<div className="fabric_selector inspector header">
				{item.properties?.imagePreview && <img src={item.properties.imagePreview} />}
				<h1>{item.name}</h1>
				<h3>{item.properties?.description}</h3>
			</div>

			<div className="fabric_selector inspector properties">
				<div className="fabric_selector inspector properties variants">
					<h3><Icons.Triangle /> Variants</h3>
					<div className="fabric_selector inspector properties variants options">
						{Array.isArray(item.properties?.variants) ?
							<antd.Select mode="tags" style={{ width: '100%' }} placeholder={`${item.properties.variants.length} variants available`} onChange={this.handleSelectVariant}>
								{item.properties.variants.map((variant) => {
									return <antd.Select.Option key={variant}>
										{variant}
									</antd.Select.Option>
								})}
							</antd.Select>
							:
							<div>
								No variants provided
							</div>
						}
					</div>
				</div>
			</div>

			<div className="fabric_selector inspector actions">
				<div>
					<antd.Button danger onClick={() => this.handleSelectBack()}>
						<Icons.ChevronLeft /> Back
					</antd.Button>
				</div>
				<div style={{ textAlign: "center" }}>
					<p>Quantity</p>
					<Stepper
						onChange={(value) => {
							this.setState({ quantity: value })
						}}
						min={1}
						keyboard={true}
						defaultValue={this.state.quantity}
					/>
				</div>
				<div>
					<antd.Button type="primary" onClick={this.handleDone}>
						<Icons.Check /> Add
					</antd.Button>
				</div>
			</div>
		</div>
	}

	renderGroups = (group) => {
		const formulaIcon = FORMULAS[group.type].icon

		return <div className="fabric_selector groups group">
			<h2>{Icons[formulaIcon] && createIconRender(formulaIcon)} {String(group.type).toTitleCase()}</h2>
			<div className="fabric_selector groups group items">
				{group.items.map((item) => {
					return <antd.List.Item
						key={item._id}
						className="fabric_selector groups group items item"
						onClick={() => this.handleSelectItem(item)}
						extra={item.properties?.previewImage && <img width={272} alt="item_view" src={item.properties.previewImage} />}
					>
						<antd.List.Item.Meta title={item.name} description={item.properties?.description} />
					</antd.List.Item>
				})}
			</div>

		</div>
	}

	render() {
		if (this.state.loading) {
			return <antd.Skeleton active />
		} 

		if (this.state.selectedItem) {
			return <div className="fabric_selector">
				{this.renderSelectedItem(this.state.selectedItem)}
			</div>
		}

		if (this.state.createCustom) {
			return <Fabric.Creator
				handleDone={(item) => {
					this.setState({ createCustom: false })
					this.handleSelectItem(item)
				}}
			/>
		}

		return (
			<div className="fabric_selector">
				<div className="header">
					<h1><Icons.Globe /> Browse</h1> or <antd.Button onClick={this.onClickCreateCustom} type="primary">Create new</antd.Button>
				</div>
				<antd.Input.Search />
				<div className="fabric_selector groups">
					<antd.List
						itemLayout="vertical"
						size="large"
						dataSource={this.parseFabricObjectsAsGroups(this.state.items)}
						pagination={{
							pageSize: 10,
						}}
						renderItem={this.renderGroups}
					/>
				</div>
			</div>
		)
	}
}