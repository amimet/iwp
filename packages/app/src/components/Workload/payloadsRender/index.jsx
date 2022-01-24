import React from "react"
import { Icons } from "components/Icons"
import * as antd from "antd"
import classnames from "classnames"

import "./index.less"

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
			return <div
				onClick={() => { onClickItem(item) }}
				className={classnames("workload_payloadItem", { ["reached"]: item.quantityReached })}
			>
				<div className="data">
					<div className="header">
						<div className="title">
							<div className="quantity">x{props.preview ? (item.properties?.quantity) : (item.debtQuantity ?? item.properties?.quantity ?? "0")}</div>
							<h2>{item.name}</h2>
						</div>
						<div className="description">{item.properties?.description ?? "No description"}</div>
					</div>

					{item.properties?.variants && <div className="variants">
						<Icons.Tool /> {item.properties.variants.map((variant, index) => <antd.Tag key={index}>{variant}</antd.Tag>)}
					</div>}
				</div>

				<div className="actions">
					{props.onDeleteItem && <antd.Button onClick={() => onClickDelete(item)} type="link">
						Delete
					</antd.Button>}
				</div>
			</div>
		}}
	/>
}