import React from "react"
import * as antd from "antd"
import debounce from "lodash/debounce"
import { Translation } from "react-i18next"

import { ActionsBar } from "components"
import { Icons } from "components/Icons"

import "./index.less"

export const EditAccountField = ({ id, component, props, header, handleChange, delay, defaultValue, allowEmpty }) => {
	const [currentValue, setCurrentValue] = React.useState(defaultValue)
	const [emittedValue, setEmittedValue] = React.useState(null)

	const debouncedHandleChange = React.useCallback(
		debounce((value) => handleChange({ id, value }), delay ?? 300),
		[],
	)

	const handleDiscard = (event) => {
		if (typeof event !== "undefined") {
			event.target.blur()
		}

		setCurrentValue(defaultValue)
		handleChange({ id, value: defaultValue })
	}

	React.useEffect(() => {
		debouncedHandleChange(currentValue)
	}, [emittedValue])

	const onChange = (event) => {
		event.persist()
		let { value } = event.target

		if (typeof value === "string") {
			if (value.length === 0) {
				// if is not allowed to be empty, discard modifications
				if (!allowEmpty) {
					return handleDiscard(event)
				}
			}
		}

		setCurrentValue(value)
		setEmittedValue(value)
	}

	const handleKeyDown = (event) => {
		if (event.keyCode === 27) {
			// "escape" pressed, reset to default value
			handleDiscard(event)
		}
	}

	const RenderComponent = component

	return (
		<div key={id} className="edit_account_field">
			{header ? header : null}
			<RenderComponent {...props} value={currentValue} id={id} onChange={onChange} onKeyDown={handleKeyDown} />
		</div>
	)
}

export default class EditAccount extends React.Component {
	state = {
		values: this.props.user ?? {},
		changes: [],
		loading: false,
	}

	onSave = async () => {
		await this.setState({ loading: true })

		const result = await this.props.onSave(this.state.changes)

		await this.setState({ changes: [], loading: false })

		if (typeof this.props.handleDone === "function") {
			this.props.handleDone(result)
		}
	}

	handleChange = (event) => {
		const { id, value } = event
		let changes = [...this.state.changes]

		changes = changes.filter((change) => change.id !== id)

		if (this.state.values[id] !== value) {
			// changes detected
			changes.push({ id, value })
		}

		this.setState({ changes })
	}

	render() {
		return (
			<div className="edit_account">
				<div className="edit_account_wrapper">
					<div className="edit_account_category">
						<h2>
							<Icons.User /> Account information
						</h2>
						<EditAccountField
							id="username"
							defaultValue={this.state.values.username}
							header={
								<div>
									<Icons.Tag /> Username
								</div>
							}
							component={antd.Input}
							props={{ placeholder: "Username", disabled: true }}
							handleChange={this.handleChange}
						/>
						<EditAccountField
							id="fullName"
							defaultValue={this.state.values.fullName}
							header={
								<div>
									<Icons.User /> Name
								</div>
							}
							component={antd.Input}
							props={{ placeholder: "Your full name" }}
							handleChange={this.handleChange}
						/>
						<EditAccountField
							id="email"
							defaultValue={this.state.values.email}
							header={
								<div>
									<Icons.Mail /> Email
								</div>
							}
							component={antd.Input}
							props={{ placeholder: "Your email address", type: "email" }}
							handleChange={this.handleChange}
						/>
					</div>
				</div>
				<ActionsBar spaced>
					<div>
						{this.state.changes.length} Changes
					</div>
					<div>
						<antd.Button loading={this.state.loading} disabled={this.state.loading} type="primary" onClick={this.onSave}>
							Save
						</antd.Button>
					</div>
				</ActionsBar>
			</div>
		)
	}
}
