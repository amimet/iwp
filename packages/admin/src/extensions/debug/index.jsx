import React from "react"
import { Window } from "components"
import { Skeleton, Tabs } from "antd"

class DebuggerUI extends React.Component {
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
			renders[key] = () => {
				try {
					return debuggers[key]()
				} catch (error) {
					return this.renderError(key, error)
				}
			}
		})

		this.setState({ debuggers: renders }, () => {
			this.toogleLoading(false)
		})
	}

	componentDidMount = async () => {
		console.log(this)
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

	renderDebugger = (key) => {
		if (!key) {
			return <div>Select a debugger</div>
		}
		return React.createElement(this.state.debuggers[key])
	}

	render() {
		const { loading, error } = this.state

		if (loading) {
			return <Skeleton active />
		}

		return (
			<div>
				<Tabs onChange={this.onChangeTab}>{this.renderTabs()}</Tabs>
				<div>{error ? this.renderError(this.state.active, error) : this.renderDebugger(this.state.active)}</div>
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
						new Window.DOMWindow({ id: "debugger", children: () => DebuggerUI }).create()
					})
				},
			],
		},
	],
}
