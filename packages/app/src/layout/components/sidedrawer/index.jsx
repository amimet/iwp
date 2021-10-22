import React from "react"
import * as antd from "antd"
import classnames from "classnames"
import { Controller } from "core/libs"

import "./index.less"

export default class Sidedrawer extends React.Component {
	state = {
		render: null,
	}
	containerRef = React.createRef()
	controller = new Controller({ id: "sidedrawer" })

	componentDidMount = () => {
		this.controller.add("render", this._render, { lock: true })
		this.controller.add("close", this.close, { lock: true })
	}

	componentWillUnmount = () => {
		this.unlistenEscape()
	}

	_render = (component) => {
		this.listenEscape()
		this.setState({ render: component })
	}

	close = () => {
		this.unlistenEscape()
		this.setState({ render: null })
	}

	listenEscape = () => {
		document.addEventListener("keydown", this.handleKeyPress)
	}

	unlistenEscape = () => {
		document.removeEventListener("keydown", this.handleKeyPress)
	}

	handleKeyPress = (event) => {
		// avoid handle keypress when is nothing to render
		if (!this.state.render) {
			return false
		}

		let isEscape = false

		if ("key" in event) {
			isEscape = event.key === "Escape" || event.key === "Esc"
		} else {
			isEscape = event.keyCode === 27
		}

		if (isEscape) {
			this.close()
		}
	}

	renderComponent = (component) => {
        if (!component) {
            return null
        }

		if (React.isValidElement(component)) {
			return React.cloneElement(component)
		}

		return React.createElement(component)
	}

	render() {
		return (
			<div ref={this.containerRef} className={classnames("sidedrawer", { hided: !this.state.render })}>
				<React.Fragment>{this.renderComponent(this.state.render)}</React.Fragment>
			</div>
		)
	}
}
