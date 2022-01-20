import React from "react"
import * as antd from "antd"
import classnames from "classnames"

import "./index.less"

export default (props) => {
	const onClickItem = (item) => {
		if (typeof props.onClickItem === "function") {
			props.onClickItem(item)
		}
	}

	const onClickDelete = (item) => {
		if (typeof props.onDeleteItem === "function") {
			props.onDeleteItem(item._id)
		}
	}

	return <antd.List
		dataSource={props.payloads}
		renderItem={(item) => {
			return <antd.List.Item
				onClick={() => { onClickItem(item) }}
				className={classnames("workload_payloadItem", { ["reached"]: item.quantityReached })}
			>
				<antd.List.Item.Meta
					avatar={<div className="workload_payloadItem quantity">x{item.properties?.quantity ?? item.quantity ?? "0"}</div>}
					title={item.name}
					description={item.properties?.description}
				/>
				<div>
					{item.selectedVariants && <div>
						<div>{item.selectedVariants.length} Variants</div>
					</div>}
				</div>
				{props.onDeleteItem && <antd.Button onClick={() => onClickDelete(item)} type="link">
					Delete
				</antd.Button>}
			</antd.List.Item>
		}}
	/>
}