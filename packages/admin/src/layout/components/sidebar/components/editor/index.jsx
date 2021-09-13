import React from "react"
import { Icons, createIconRender } from "components/icons"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

import defaultSidebarKeys from "schemas/defaultSidebar.json"
import sidebarItems from "schemas/sidebar.json"
import bottomSidebarItems from "schemas/bottomSidebar.json"

import "./index.less"

const allItemsMap = [...sidebarItems, ...bottomSidebarItems].map((item, index) => {
	item.key = index.toString()
	return item
})

const getAllItems = () => {
	let items = {}

	allItemsMap.forEach((item) => {
		items[item.id] = {
			...item,
			id: item.id,
			key: item.key,
			content: (
				<>
					{createIconRender(item.icon)} {item.title}
				</>
			),
		}
	})

	return items
}

const allItems = getAllItems()

export default class SidebarEdit extends React.Component {
	state = {
		items: [],
		activeObjects: [],
		disabledObjects: [],
	}

	update = () => {
		const items = this.state.items
		let obj = []

		items.forEach((item, index) => {
			obj[index] = item.id
		})

		window.app.controllers.sidebar._push(obj)
	}

	reorder = (list, startIndex, endIndex) => {
		const result = Array.from(list)
		const [removed] = result.splice(startIndex, 1)
		result.splice(endIndex, 0, removed)

		return result
	}

	onDragEnd = (result) => {
		if (!result.destination) {
			return
		}

		const items = this.reorder(this.state.items, result.source.index, result.destination.index)

		this.setState({ items }, () => {
			this.update()
		})
	}

	componentDidMount() {
		let active = []
		let disabled = []

		const storagedKeys = window.app.params.sidebar.get()

		storagedKeys.forEach((key) => {
			let item = allItems[key]
			if (typeof item !== "undefined") {
				active.push(item)
			}
		})

		allItemsMap.forEach((item) => {
			if (!active.includes(item.id)) {
				disabled.push(item.id)
			}
		})

		this.setState({ items: active })
	}

	render() {
		const grid = 6

		const getItemStyle = (isDragging, draggableStyle) => ({
			userSelect: "none",
			padding: grid * 2,
			margin: `0 0 ${grid}px 0`,
			borderRadius: "6px",
			transition: "150ms all ease-in-out",
			width: "100%",

			background: isDragging ? "rgba(145, 145, 145, 0.5)" : "rgba(145, 145, 145, 0.9)",
			...draggableStyle,
		})

		const getListStyle = (isDraggingOver) => ({
			background: isDraggingOver ? "rgba(145, 145, 145, 0.5)" : "transparent",
			transition: "150ms all ease-in-out",

			padding: grid,
			width: "100%",
		})

		return (
			<div>
				<DragDropContext onDragEnd={this.onDragEnd}>
					<Droppable droppableId="droppable">
						{(droppableProvided, droppableSnapshot) => (
							<div
								ref={droppableProvided.innerRef}
								style={getListStyle(droppableSnapshot.isDraggingOver)}
							>
								{this.state.items.map((item, index) => (
									<Draggable key={item.id} draggableId={item.id} index={index}>
										{(draggableProvided, draggableSnapshot) => (
											<div
												ref={draggableProvided.innerRef}
												{...draggableProvided.draggableProps}
												{...draggableProvided.dragHandleProps}
												style={getItemStyle(
													draggableSnapshot.isDragging,
													draggableProvided.draggableProps.style,
												)}
											>
												{item.content}
											</div>
										)}
									</Draggable>
								))}
								{droppableProvided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>
		)
	}
}