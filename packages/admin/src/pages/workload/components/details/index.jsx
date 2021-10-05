import React from "react"
import { AppLoading } from "components"
import * as antd from "antd"
import { Icons } from "components/Icons"
import DataMatrixGenerator from "core/dataMatrix"
import pbm2canvas from "core/pbmToCanvas"

import "./index.less"

const api = window.app.apiBridge

export default class WorkloadDetails extends React.Component {
	state = {
		data: null,
		matrixCanvas: null,
	}

	componentDidMount = async () => {
		if (typeof this.props.id === "string") {
			this.id = this.props.id
		}

		const data = await api.get.workload(undefined, { _id: this.id })

		this.setState({ data, matrixCanvas: this.generateMatrixCanvas() })
	}
	
	generateMatrix = () => {
		const instance = new DataMatrixGenerator()
		instance.encodeAscii(this.id)

		return instance
	}

	generateMatrixCanvas = () => {
		const bitmap = this.generateMatrix().renderPBM()
		let canvas = pbm2canvas(bitmap, undefined, { scale: 4 })
		
		return canvas
	}

	downloadMatrix = () => {
		const canvas = this.state.matrixCanvas
		const link = document.createElement("a")
		link.download = `matrix_${this.id}.png`

		link.href = canvas.toDataURL("image/png")
		link.click()
	}

	render() {
		const { data } = this.state
		if (data == null) {
			return <AppLoading />
		}

		const createdDate = new Date(data.created)

		return (
			<div className="workload_details">
				<div className="header">
					<div>
						<h1>
							<Icons.Box /> {data.name}
						</h1>
						<div>
							<antd.Tag>
								<Icons.Tag />
								ID {this.id}
							</antd.Tag>
							<antd.Tag>
								<Icons.User />
								NOF {data.nof}
							</antd.Tag>
							<antd.Tag>
								<Icons.GitBranch />
								Phase {data.phase}
							</antd.Tag>
							<antd.Tag>
								<Icons.Activity />
								{data.status}
							</antd.Tag>
						</div>
					</div>

					<div className="matrix">
						<antd.Tooltip placement="bottom" title="Download">
							<img onClick={this.downloadMatrix} src={this.state.matrixCanvas.toDataURL("image/png")} />
						</antd.Tooltip>
					</div>
				</div>

				<div key="scheduled">
					<h2>
						<Icons.Calendar /> Scheduled
					</h2>
					<div className="body">
						<antd.Steps size="small" progressDot current={144}>
							<antd.Steps.Step description={data.scheduledStart} />
							<antd.Steps.Step description={data.scheduledFinish} />
						</antd.Steps>
					</div>
				</div>
				<div key="scheduled2">
					<h2>
						<Icons.Calendar /> Scheduled
					</h2>
					<div className="scheduled_progress">
						<div className="point">{data.scheduledStart}</div>
						<antd.Progress
							size="small"
							strokeColor="default"
							percent="40"
							showInfo={false}
							type="line"
							status={data.status !== "done" ? "active" : "normal"}
						/>
						<div className="point">{data.scheduledFinish}</div>
					</div>
				</div>
				<div>
					<antd.Row gutter={[16, 16]}>
						<antd.Col span={12}>
							<antd.Timeline mode="right">
								<antd.Timeline.Item label={createdDate.toLocaleString()}>Created</antd.Timeline.Item>
							</antd.Timeline>
						</antd.Col>
						<antd.Col span={12}></antd.Col>
					</antd.Row>
				</div>
				<div key="assigned"></div>
				<div key="items"></div>
			</div>
		)
	}
}
