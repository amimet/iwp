import React from "react"
import * as antd from "antd"
import classnames from "classnames"
import { Translation } from "react-i18next"

import { Icons } from "components/Icons"

import "./index.less"

const Payload = (props) => {
	const { item } = props

	return <div
		onClick={() => { props.onClickItem(item) }}
		className={classnames("workorder_payloadItem", { ["reached"]: item.quantityReached })}
	>
		<div className="data">
			<div className="header">
				<div className="title">
					{props.preview && <div className="quantity">x{item.properties?.quantity}</div>}
					<antd.Badge status="processing" count={props.indicator}>
						<h2>{item.name}</h2>
					</antd.Badge>
				</div>
				<div className="description">
					<Translation>
						{t => t(item.properties?.description ?? "No description")}
					</Translation>
				</div>
			</div>

			{item.properties?.variants && <div className="variants">
				<Icons.Tool /> {item.properties.variants.map((variant, index) => <antd.Tag key={index}>{variant}</antd.Tag>)}
			</div>}
		</div>

		<div className="actions">
			{props.onClickDelete && <antd.Button onClick={() => props.onClickDelete(item)} type="link">
				<Translation>
					{t => t("Delete")}
				</Translation>
			</antd.Button>}
		</div>
	</div>
}

export default (props) => {
	const onClickItem = (item) => {
		if (typeof props.onClickItem === "function") {
			props.onClickItem({
				_id: item._id,
				key: item.key,
				uuid: item.uuid,
			})
		}
	}

	const onClickDelete = (item) => {
		if (typeof props.onDeleteItem === "function") {
			props.onDeleteItem({
				_id: item._id,
				key: item.key,
				uuid: item.uuid,
			})
		}
	}

	return <antd.List
		dataSource={props.payloads}
		renderItem={(item) => {
			let payloadProps = {
				preview: props.preview,
				item,
				onClickItem,
			}

			if (props.selfUserId && Array.isArray(item.activeWorkers)) {
				item.activeWorkers.forEach(worker => {
					if (worker.userId === props.selfUserId) {
						payloadProps.indicator = "Active"
					}
				})
			}

			props.onDeleteItem && (payloadProps.onClickDelete = onClickDelete)

			return <Payload {...payloadProps} />
		}}
	/>
}