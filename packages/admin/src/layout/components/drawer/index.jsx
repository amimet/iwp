import React from "react"
import { Controller } from "core/libs"
import * as antd from "antd"

export class Drawer extends React.Component {
	options = this.props.options ?? {}

	state = {
		locked: this.options.locked ?? false,
		visible: false,
	}

	unlock = () => this.setState({ locked: false })
	lock = () => this.setState({ locked: true })

	onClose = () => {
		if (typeof this.options.props?.closable !== "undefined" && !this.options.props?.closable) {
			return false
		}
		this.close()
	}

	close = () => {
		if (typeof this.options.onClose === "function") {
			this.options.onClose(...context)
		}

		this.setState({ visible: false })
		this.unlock()

		setTimeout(() => {
			this.props.controller.destroy(this.props.id)
		}, 400)
	}

	componentDidMount = async () => {
		if (typeof this.props.controller === "undefined") {
			throw new Error(`Cannot mount an drawer without an controller`)
		}
		if (typeof this.props.children === "undefined") {
			throw new Error(`Empty component`)
		}

		if (this.props.children) {
			this.setState({ visible: true })
		}
	}

	onDone = () => {
		if (typeof this.options.onDone === "function") {
			this.options.onDone(this)
		}
	}

	onFail = () => {
		if (typeof this.options.onFail === "function") {
			this.options.onFail(this)
		}
	}

	render() {
		const drawerProps = {
			...this.options.props,
			onClose: this.onClose,
			ref: this.props.ref,
			visible: this.state.visible,
		}
		const componentProps = {
			...this.options.componentProps,
			onDone: this.onDone,
			onFail: this.onFail,
		}

		return <antd.Drawer key={this.props.id} {...drawerProps}>{React.createElement(this.props.children, componentProps)}</antd.Drawer>
	}
}

export default class DrawerController extends React.Component {
	windowController = new Controller({ id: "drawer", locked: true })

	state = {
		addresses: {},
		refs: {},
		drawers: [],
	}

	componentDidMount() {
		this.windowController.add("open", this.open, { lock: true })
		this.windowController.add("close", this.close, { lock: true })
		this.windowController.add("closeAll", this.closeAll, { lock: true })
	}

	open = (id, component, options) => {
		const refs = this.state.refs ?? {}
		const drawers = this.state.drawers ?? []
		const addresses = this.state.addresses ?? {}

		const instance = {
			id,
			ref: React.createRef(),
			children: component,
			options,
			controller: this,
		}

		if (typeof addresses[id] === "undefined") {
			drawers.push(<Drawer {...instance} />)
			addresses[id] = drawers.length - 1
			refs[id] = instance.ref
		} else {
			const ref = refs[id].current
			const isLocked = ref.state.locked

			if (!isLocked) {
				drawers[addresses[id]] = <Drawer {...instance} />
				refs[id] = instance.ref
			} else {
				console.warn("Cannot update an locked drawer.")
			}
		}

		this.setState({ refs, addresses, drawers })
	}

	destroy = (id) => {
		let { addresses, drawers, refs } = this.state
		const index = addresses[id]

		if (typeof drawers[index] !== "undefined") {
			drawers = drawers.filter((value, i) => i !== index)
		}
		delete addresses[id]
		delete refs[id]

		this.setState({ addresses, drawers })
	}

	close = (id) => {
		const ref = this.state.refs[id]?.current

		if (typeof ref !== "undefined") {
			if (ref.state.locked && ref.state.visible) {
				return console.warn("This drawer is locked and cannot be closed")
			} else {
				return ref.close()
			}
		} else {
			return console.warn("This drawer not exists")
		}
	}

	closeAll = () => {
		this.state.drawers.forEach(drawer =>{
			drawer.ref.current.close()
		})
	}

	render() {
		return this.state.drawers
	}
}
