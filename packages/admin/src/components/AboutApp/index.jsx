import React from "react"
import ReactDOM from "react-dom"

import * as antd from "antd"
import { Icons } from "components/Icons"
import config from "config"

import "./index.less"

export class AboutApp extends React.Component {
	render() {
		const { about } = window.app
		const isDevMode = about.environment === "development"

		return (
			<antd.Modal visible centered footer={false} width="80%">
				<div className="about_app_wrapper">
					<div className="about_app_header">
						<div>
							<img src={config.logo.alt} />
						</div>
						<div >
							<h1>{about.siteName}</h1>
							<div>
								<antd.Tag>
									<Icons.Tag />v{about.version}
								</antd.Tag>
						
								<antd.Tag color={isDevMode ? "magenta" : "green"}>
									{isDevMode ? <Icons.Triangle /> : <Icons.CheckCircle />}
									{about.environment}
								</antd.Tag>
							</div>
						</div>
					</div>
                    <div className="about_app_info">

                    </div>
				</div>
			</antd.Modal>
		)
	}
}

export function openModal() {
	const component = document.createElement("div")
	document.body.appendChild(component)

	ReactDOM.render(<AboutApp />, component)
}
