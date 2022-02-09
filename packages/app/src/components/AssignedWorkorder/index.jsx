import React from "react"

import "./index.less"

export default (props) => {
    if (!props.workorder) {
        return null
    }

    const onClick = () => {
        if (typeof props.onClick === "function") {
            return props.onClick(props.workorder._id)
        }
    }

    return <div onClick={onClick} key={props.workorder._id} className="assigned_workorder">
        <span>#{String(props.workorder._id).toUpperCase()}</span>
        <h2>{props.workorder.name}</h2>
    </div>
}