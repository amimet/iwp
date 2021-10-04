import React from "react"
import { Window } from "components"
import { Skeleton, Tabs } from "antd"
import { GlobalBindingProvider } from "evite"

class DebuggerUI extends React.Component {
	appBinding = this.props.app

	state = {
		loading: true,
		error: null,
		debuggers: null,
		active: null,
	}

	toogleLoading = (to = !this.state.loading ?? false) => {
		this.setState({ loading: to })
	}

	loadDebuggers = async () => {
		this.toogleLoading(true)

		const debuggers = await import(`@/debug`)
		let renders = {}

		Object.keys(debuggers).forEach((key) => {
			renders[key] = debuggers[key]
		})

		this.setState({ debuggers: renders }, () => {
			this.toogleLoading(false)
		})
	}

	componentDidMount = async () => {
		await this.loadDebuggers()
	}

	componentDidCatch = (error, info) => {
		this.setState({ error })
	}

	onChangeTab = (key) => {
		this.setState({ active: key, error: null })
	}

	renderError = (key, error) => {
		return (
			<div>
				<h2>Debugger Error</h2>
				<i>
					<h4>
						Catch on [<strong>{key}</strong>]
					</h4>
				</i>
				`<code>{error.message}</code>`
				<hr />
				<code>{error.stack}</code>
			</div>
		)
	}

	renderTabs = () => {
		return Object.keys(this.state.debuggers).map((key) => {
			return <Tabs.TabPane tab={key} key={key} />
		})
	}

	renderDebugger = (_debugger, context) => {
		try {
			return <_debugger {...context} />
		} catch (error) {
			return this.renderError(key, error)
		}
	}

	render() {
		const { loading, error } = this.state

		if (loading) {
			return <Skeleton active />
		}

		return (
			<div>
				<Tabs onChange={this.onChangeTab}>{this.renderTabs()}</Tabs>
				{error && this.renderError(this.state.active, error)}
				{!this.state.active ? (
					<div> Select an debugger to start </div>
				) : (
					this.renderDebugger(this.state.debuggers[this.state.active], { appBinding: this.appBinding })
				)}
			</div>
		)
	}
}

export default {
	key: "visualDebugger",
	expose: [
		{
			attachToInitializer: [
				async (self) => {
					self.appendToApp("openDebug", () => {
						new Window.DOMWindow({ id: "debugger", children: self.connectWithApp(DebuggerUI) }).create()
					})
				},
			],
		},
	],
}
