import React from "react"
import * as antd from "antd"
import { Stepper, Swiper, Image } from "antd-mobile"
import { Icons, createIconRender } from "components/Icons"
import { Fabric, Skeleton } from "components"
import { Translation } from "react-i18next"

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

	getImagePreviews = (items) => {
		return items.map((item) => {
			return <Swiper.Item>
				<Image src={item} />
			</Swiper.Item>
		})
	}

	//TODO: Split as `bruhSomething` component
	renderSelectedItem = (item) => {
		return <div className="inspector">
			<div className="header">
				{this.getImagePreviews(item.properties.imagePreview)}
				<Translation>
					{(t) => <h1>{t(item.name)}</h1>}
				</Translation>
				<Translation>
					{(t) => <h3>{t(item.properties?.description)}</h3>}
				</Translation>
			</div>

			<div className="properties">
				<div className="property">
					<h3><Icons.Triangle />
						<Translation>
							{(t) => t("Variants")}
						</Translation>
					</h3>
					<div className="option">
						{Array.isArray(item.properties?.variants) ?
							<antd.Select
								mode="tags"
								style={{ width: '100%' }}
								placeholder={<Translation>
									{(t) => `${item.properties.variants.length} ${t("variants available")}`}
								</Translation>}
								onChange={this.handleSelectVariant}
							>
								{item.properties.variants.map((variant) => {
									return <antd.Select.Option key={variant}>
										<Translation>
											{(t) => t(variant)}
										</Translation>
									</antd.Select.Option>
								})}
							</antd.Select>
							:
							<div>
								<Translation>
									{(t) => t("No variants provided")}
								</Translation>
							</div>
						}
					</div>
				</div>
			</div>

			<div className="actions">
				<div>
					<antd.Button danger onClick={() => this.handleSelectBack()}>
						<Icons.ChevronLeft /> <Translation>
							{(t) => t("Back")}
						</Translation>
					</antd.Button>
				</div>
				<div style={{ textAlign: "center" }}>
					<p><Translation>
						{(t) => t("Quantity")}
					</Translation></p>
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
						<Icons.Check /> <Translation>
							{(t) => t("Add")}
						</Translation>
					</antd.Button>
				</div>
			</div>
		</div>
	}

	renderGroups = (group) => {
		const formulaIcon = FORMULAS[group.type].icon

		return <div className="group">
			<h2>{Icons[formulaIcon] && createIconRender(formulaIcon)} <Translation>
				{(t) => t(String(group.type).toTitleCase())}
			</Translation></h2>
			<div className="items">
				{group.items.map((item) => {
					return <antd.List.Item
						key={item._id}
						className="item"
						onClick={() => this.handleSelectItem(item)}
						extra={item.properties?.previewImage && <img width={272} alt="item_view" src={item.properties.previewImage} />}
					>
						<antd.List.Item.Meta
							title={
								<Translation>
									{(t) => t(item.name)}
								</Translation>
							}
							description={
								<Translation>
									{(t) => t(item.properties?.description)}
								</Translation>
							}
						/>
					</antd.List.Item>
				})}
			</div>

		</div>
	}

	render() {
		if (this.state.loading) {
			return <Skeleton active />
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
					<h1><Icons.Globe />
						<Translation>
							{(t) => t("Browse")}
						</Translation>
					</h1>
					<Translation>
						{(t) => t("or")}
					</Translation>
					<antd.Button onClick={this.onClickCreateCustom} type="primary">
						<Translation>
							{(t) => t("Create new")}
						</Translation>
					</antd.Button>
				</div>
				<div>
					<antd.Input.Search />
				</div>
				<div className="groups">
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