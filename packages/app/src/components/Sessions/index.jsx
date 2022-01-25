import React from "react"
import * as antd from "antd"
import { Icons } from "components/icons"

import "./index.less"

export default (props) => {
	const sessions = props.sessions.map((session) => {
		const header = (
			<div className="session_header">
				<div>
					<Icons.Key />
				</div>
				<div>{session.session_uuid}</div>
				<div>{props.current === session.session_uuid ? <antd.Tag>Current</antd.Tag> : ""}</div>
			</div>
		)

		const renderDate = () => {
			const dateNumber = Number(session.date)

			if (dateNumber) {
				return new Date(dateNumber).toString()
			}
			return session.date
		}

		return (
			<antd.Collapse.Panel header={header} key={session.session_uuid} className="session_entry">
				<div className="session_entry_info">
					<div>
						<Icons.Clock />
						{renderDate()}
					</div>
					<div>
						<Icons.Navigation />
						{session.location}
					</div>
				</div>
			</antd.Collapse.Panel>
		)
	})

	if (!props.sessions || !Array.isArray(props.sessions)) {
		return <div>
			<antd.Empty>
				Cannot find any valid sessions
			</antd.Empty>
		</div>
	}

	return <div className="sessions_wrapper">
		<antd.Collapse bordered={false} accordion>
			{sessions}
		</antd.Collapse>
	</div>
}
