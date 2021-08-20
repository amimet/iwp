import React from "react"
import { Icons } from "components/Icons"
import { LoadingSpinner } from "components"
import {  Button,  List,  Checkbox, InputNumber } from "antd"

import "../../index.less"

let mockFabricDB = [
	{
		key: "pantalon_test",
		title: "Pantalon TEST (MARCA)",
		img: "https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png",
		description: "Pantalon basico, prueba",
		cost: 20,
		timeSpend: 4000, // on seconds
		props: {
			color_white: {
				title: "Color Blanco",
				description: "Tinte de color blanco",
			},
			bolsillo_basico: {
				title: "Bolsillo basico",
				description: "Bolsillo (100x100 Profundidad)",
				timeSpend: 1000,
			},
			buttons: {
				title: "Botones",
				timeSpend: 2400,
				cost: 5,
			},
		},
	},
]

export default class WorkloadSelector extends React.Component {
	state = {
		loading: true,
		items: [],
		selectedItem: false,
	}

	componentDidMount = async () => {
		let items = []

		// TODO: collect all items from API

		//mock data
		items = mockFabricDB

		//update state
		this.setState({
			items: [...this.state.items, ...items],
			loading: false,
		})
	}

	handleDone = (obj, props, quantity) => {
		if (typeof this.props.onDone === "function") {
			this.props.onDone({obj, props, quantity})
		}
	}

	handleSelectItem = (item) => {
		this.setState({ selectedItem: item })
	}

	handleSelectBack = () => {
		this.setState({ selectedItem: false })
	}

	renderSelectedItem = (item) => {
		let selectedProps = []
		let quantity = 1

		const handlePropCheckbox = (e) => {
			const { checked, id } = e.target

			if (checked) {
				if (!selectedProps.includes(id)) {
					selectedProps.push(id)
				}
			} else {
				selectedProps = selectedProps.filter((prop) => prop !== id)
			}
		}

		return (
			<div>
				<div
					onClick={this.handleSelectBack}
					style={{
						cursor: "pointer",
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						borderRadius: "8px",
						border: "1px solid #424242",
						width: "fit-content",
						height: "fit-content",
						padding: "0 8px",
					}}
				>
					<Icons.ChevronLeft />
					<h3 style={{ margin: 0 }}> Back</h3>
				</div>
				<div className="workload_item_selection_wrapper">
					<div className="workload_item_selection_header">
						<img src={item.img} />
						<h3>{item.title}</h3>
						<p>{item.description}</p>
					</div>
					<div className="workload_item_selection_props">
						{Object.keys(item.props).map((key) => {
							const prop = item.props[key]
							return (
								<div>
									<Checkbox id={key} key={key} onChange={handlePropCheckbox}>
										{prop.title}
									</Checkbox>
								</div>
							)
						})}
					</div>
					<div className="workload_item_selection_actions">
						<InputNumber
							onChange={(value) => {
								quantity = value
							}}
							min={1}
							keyboard={true}
							defaultValue={1}
						/>

						<Button type="primary" onClick={() => this.handleDone(item, selectedProps, quantity)}>
							<Icons.Check /> Add
						</Button>
					</div>
				</div>
			</div>
		)
	}

	render() {
		const { loading, selectedItem } = this.state

		if (loading) return <LoadingSpinner />

		if (selectedItem) {
			return this.renderSelectedItem(selectedItem)
		}

		return (
			<div>
				<List
					itemLayout="vertical"
					size="large"
					pagination={{
						onChange: (page) => {
							console.log(page)
						},
						pageSize: 3,
					}}
					dataSource={this.state.items}
					renderItem={(item) => (
						<List.Item
							onClick={() => this.handleSelectItem(item)}
							className="workload_fabric_item"
							key={item.title}
							extra={<img width={272} alt="item_view" src={item.img} />}
						>
							<List.Item.Meta title={item.title} description={item.description} />
						</List.Item>
					)}
				/>
			</div>
		)
	}
}