import React from "react"
import ReactDOM from "react-dom"
import * as antd from "antd"
import { Card, Mask } from "antd-mobile"

import { Icons } from "components/Icons"
import config from "config"

import "./index.less"

export const AboutCard = (props) => {
	const [visible, setVisible] = React.useState(false)

	React.useEffect(() => {
		setVisible(true)
	}, [])

	const close = () => {
		setVisible(false)
		setTimeout(() => {
			props.onClose()
		}, 150)
	}

	const eviteNamespace = window.__evite ?? {}
	const appConfig = config.app ?? {}
	const isDevMode = eviteNamespace?.env?.NODE_ENV !== "production"

	return <Mask visible={visible} onMaskClick={() => close()}>
		<div className="about_app_wrapper">
			<Card title={appConfig.siteName}>
				<div>
					<antd.Tag>
						<Icons.Tag />v{eviteNamespace?.projectVersion ?? " experimental"}
					</antd.Tag>
					{eviteNamespace.eviteVersion &&
						<antd.Tag color="geekblue">eVite v{eviteNamespace?.eviteVersion}</antd.Tag>}
					{eviteNamespace.version?.node && <antd.Tag color="green">
						<Icons.Hexagon /> v{eviteNamespace?.versions?.node}
					</antd.Tag>}
					<antd.Tag color={isDevMode ? "magenta" : "green"}>
						{isDevMode ? <Icons.Triangle /> : <Icons.CheckCircle />}
						{isDevMode ? "development" : "stable"}
					</antd.Tag>
				</div>
			</Card>
		</div>
	</Mask>
}

export function openModal() {
	const component = document.createElement("div")
	document.body.appendChild(component)

	const onClose = () => {
		ReactDOM.unmountComponentAtNode(component)
		document.body.removeChild(component)
	}

	ReactDOM.render(<AboutCard onClose={onClose} />, component)
}