import React from "react"
import ReactDOM from "react-dom"
import { Rnd } from "react-rnd"
import { Icons } from "components/Icons"

import "./index.less"

class DOMWindow {
	constructor(props) {
		this.props = { ...props }

		this.id = this.props.id
		this.key = 0

		this.root = document.getElementById("app_windows")
		this.window = document.getElementById(this.id)
	}

	create = () => {
		// handle root container
		if (!this.root) {
			this.root = document.createElement("div")
			this.root.setAttribute("id", "app_windows")

			document.body.append(this.root)
		}

		// get all windows opened has container
		const rootNodes = this.root.childNodes

		// ensure this window has last key from rootNode
		if (rootNodes.length > 0) {
			const lastChild = rootNodes[rootNodes.length - 1]
			const lastChildKey = Number(lastChild.getAttribute("key"))

			this.key = lastChildKey + 1
		}

		// create window
		this.window = document.createElement("div")
		this.window.setAttribute("id", this.id)
		this.window.setAttribute("key", this.key)

		this.root.appendChild(this.window)

		// set render
		ReactDOM.render(
			<WindowRender {...this.props} id={this.id} key={this.key} destroy={this.destroy} />,
			this.window,
		)

		return this
	}

	destroy = () => {
		this.window.remove()
		return this
	}
}

class WindowRender extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			actions: [],
			dimensions: {
				height: this.props.height ?? 600,
				width: this.props.width ?? 400,
			},
			position: this.props.defaultPosition ?? this.getCenterPosition(),
		}

		this.setDefaultActions()

		if (typeof this.props.actions !== "undefined") {
			if (Array.isArray(this.props.actions)) {
				const actions = this.state.actions ?? []

				this.props.actions.forEach((action) => {
					actions.push(action)
				})

				this.setState({ actions })
			}
		}
	}

	getCenterPosition = () => {
		const dimensions = this.state?.dimensions ?? {}

		const height = dimensions.height ?? 600
		const width = dimensions.width ?? 400

		return {
			y: Number(window.screen.height / 2 - height / 2),
			x: Number(window.screen.width / 2 - width / 2),
		}
	}

	setDefaultActions = () => {
		const { actions } = this.state

		actions.push({
			key: "close",
			render: () => <Icons.XCircle style={{ margin: 0, padding: 0 }} />,
			onClick: () => {
				this.props.destroy()
			},
		})

		this.setState({ actions })
	}

	renderActions = () => {
		const actions = this.state.actions

		if (Array.isArray(actions)) {
			return actions.map((action) => {
				return (
					<div key={action.key} onClick={action.onClick} {...action.props}>
						{React.isValidElement(action.render) ? action.render : React.createElement(action.render)}
					</div>
				)
			})
		}

		return null
	}

	render() {
		const { children, renderProps } = this.props
		const { position, dimensions } = this.state

		return (
			<Rnd
				default={{
					...position,
					...dimensions,
				}}
				onResize={(e, direction, ref, delta, position) => {
					this.setState({
						dimensions: {
							width: ref.offsetWidth,
							height: ref.offsetHeight,
						},
						position,
					})
				}}
				dragHandleClassName="window_topbar"
				minWidth={this.props.minWidth ?? "300px"}
				minHeight={this.props.minHeight ?? "200px"}
			>
				<div
					style={{
						height: dimensions.height,
						width: dimensions.width,
					}}
					className="window_wrapper"
				>
					<div className="window_topbar">
						<div className="title">{this.props.id}</div>
						<div className="actions">{this.renderActions()}</div>
					</div>

					<div className="window_body">
						{React.cloneElement(children, {...renderProps})}
					</div>
				</div>
			</Rnd>
		)
	}
}

export { DOMWindow, WindowRender }
