import React from "react"
import * as antd from "antd"

import { Icons } from "components/Icons"

import "./index.less"

export default (props) => {
    const [operators, setOperators] = React.useState([])

    window.app.handleWSListener("userConnected", (user) => {
        if (user.roles.includes("operator")) {
            setOperators((prev) => [...prev, user])
        }
    })

    window.app.handleWSListener("userDisconnected", (user) => {
        if (user.roles.includes("operator")) {
            setOperators((prev) => prev.filter((u) => u.id !== user.id))
        }
    })

    return <div className="manager_qv">
        <h2><Icons.Users /> Operators </h2>
        {operators.length > 0 ?
            operators.map((operator) => <div>
                {operator.username}
            </div>) :
            <div>
                No operators connected
            </div>
        }
    </div>
}