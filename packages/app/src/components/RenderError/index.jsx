import React from "react"
import { Result, Button, Typography } from "antd"
import { CloseCircleOutlined } from "@ant-design/icons"

const { Paragraph, Text } = Typography

const ErrorEntry = (props) => {
	const { error } = props
	
	if (!error) {
		return <Paragraph>
			<CloseCircleOutlined style={{
				color: "red",
				marginRight: "10px",
			}} />
			Unhandled error
		</Paragraph>
	}

	return <Paragraph>
		<CloseCircleOutlined style={{
			color: "red",
			marginRight: "10px",
		}} />
		{error.info.toString()}
	</Paragraph>
}

export default (props) => {
	let errors = []

	if (Array.isArray(props.error)) {
		errors = props.error
	} else {
		errors.push(props.error)
	}

	return (
		<div>
			<Result
				status="error"
				title="Render Error"
				subTitle="It seems that the application is having problems displaying this page, we have detected some unrecoverable errors due to a bug. (This error will be automatically reported to the developers to find a solution as soon as possible)"
			>
				<div className="desc">
					<Paragraph>
						<Text
							strong
							style={{
								fontSize: 16,
							}}
						>
							We have detected the following errors:
						</Text>
					</Paragraph>
					{errors.map((error) => {
						return <ErrorEntry error={error} />
					})}
				</div>
			</Result>
		</div>
	)
}
