import React from "react"

import "./index.less"

export default (props) => {
    if (!props.workload) {
        return null
    }

    return <div key={props.workload._id} className="assigned_workload">
        #{props.workload._id} <h2>{props.workload.name}</h2>
    </div>
}
