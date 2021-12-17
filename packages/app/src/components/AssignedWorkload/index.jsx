import React from "react"

import "./index.less"

export default (props) => {
    if (!props.workload) {
        return null
    }

    const onClick = () => {
        if (typeof props.onClick === "function") {
            return props.onClick(props.workload._id)
        }
    }

    return <div onClick={onClick} key={props.workload._id} className="assigned_workload">
        <div>
            #{props.workload._id}
            <h2>{props.workload.name}</h2>
        </div>
    </div>
}