import React from "react"
import { Icons, createIconRender } from "components/icons"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

import defaultSidebarKeys from "schemas/defaultSidebar.json"
import sidebarItems from "schemas/sidebar.json"

import "./index.less"

const allItemsMap = [...sidebarItems].map((item, index) => {
	item.key = index.toString()
	item.index = index
	return item
})

const getAllItems = () => {
	let items = {}

	allItemsMap.forEach((item) => {
		items[item.id] = {
			...item,
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

export default class SidebarEditor extends React.Component {
	state = {
		items: [],
		lockedIndex: []
	}

	componentDidMount() {
		const storagedKeys = window.app.configuration.sidebar.get() ?? defaultSidebarKeys
		const active = []
		const lockedIndex = []

		// set current active items
		storagedKeys.forEach((key) => {
			if (typeof allItems[key] !== "undefined") {
				if (allItems[key].locked) {
					lockedIndex.push(allItems[key].index)
				}
				active.push(key)
			}
		})

		this.setState({ items: active, lockedIndex })
	}

	reorder = (list, startIndex, endIndex) => {
		const result = Array.from(list)
		const [removed] = result.splice(startIndex, 1)
		result.splice(endIndex, 0, removed)

		return result
	}

	onDragEnd = (result) => {
		if (!result.destination) {
			return false
		}

		if (this.state.lockedIndex.includes(result.destination.index)) {
			return false
		}

		if (allItems[result.draggableId].locked) {
			console.warn("Cannot move an locked item")
			return false
		}
		
		const items = this.reorder(this.state.items, result.source.index, result.destination.index)

		this.setState({ items }, () => {
			window.app.configuration.sidebar._push(items)
		})
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
								{this.state.items.map((item, index) => {
									const itemComponent = allItems[item]

									return (
										<Draggable isDragDisabled={itemComponent.locked} key={item} draggableId={item} index={index}>
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
													{itemComponent.content ?? itemComponent.title ?? itemComponent.id}
												</div>
											)}
										</Draggable>
									)
								})}
								{droppableProvided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>
		)
	}
}
