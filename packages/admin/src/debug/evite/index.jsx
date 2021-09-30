import React from "react"
import ReactJson from "react-json-view"

import "./index.less"

export default (props = {}) => {
	const { appBinding } = props

	console.log(appBinding)
	
	const getClassname = (classname) => {
		return `evite-debugger_${classname}`
	}

	const getExtensions = () => {
		const extensions = {}

		Array.from(appBinding.constructorContext.extensions).forEach((extension) => {
			extensions[extension.key] = extension
		})

		return extensions
	}

	return (
		<div>
			{!appBinding && (
				<div className={getClassname("warning_bindingDisabled")}>
					<strong>
						⚠️ Warning! Cannot access to <code>evite.appBinding</code>, debugger is limited.
					</strong>
				</div>
			)}
			<div className={getClassname("content")}>
				<div>
					<h4>📦 Namespace</h4>
					<div>
						<ReactJson name="window.__evite" collapsed="true" src={window.__evite} />
					</div>
				</div>
				<div>
					<h4>📦 AppContext</h4>
					<div>
						<ReactJson name="app" collapsed="true" src={appBinding} />
					</div>
				</div>
				<div>
					<h4>🧰 Extensions</h4>
					<div>
						<ReactJson name="extensions" collapsed="true" src={getExtensions()} />
					</div>
				</div>
			</div>
		</div>
	)
}
