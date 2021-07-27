import React from "react"
import * as antd from "antd"
import { Icons } from "components/icons"

import "./index.less"

export default class Sessions extends React.Component {
	renderSessions = () => {
		const data = this.props.sessions
		return data.map((session) => {
			const header = (
				<>
					<Icons.Key />
					{session._id}
				</>
			)

			const renderDate = () => {
				const dateNumber = Number(session.date)

				if (dateNumber) {
					return new Date(dateNumber).toString()
				}
				return session.date
			}
			
			return (
				<antd.Collapse.Panel header={header} key={session._id} className="session_entry">
					<div className="session_entry_info">
						<div>
							<Icons.Clock />
							{renderDate()}
						</div>
						<div>
							<Icons.Navigation />
							{session.location}
						</div>
						<div>
							<Icons.Map />
							{session.geo}
						</div>
					</div>
				</antd.Collapse.Panel>
			)
		})
	}

	render() {
		console.log(this.props.sessions)

		if (Array.isArray(this.props.sessions)) {
			return (
				<div className="sessions_wrapper">
					<antd.Collapse bordered={false} accordion>
						{this.renderSessions()}
					</antd.Collapse>
				</div>
			)
		}

		return <div></div>
	}
}
