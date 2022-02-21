import React from "react"
import * as antd from "antd"

import { Icons } from "components/Icons"

import "./index.less"

export default (props) => {
    const [operators, setOperators] = React.useState([])

    window.app.ws.listen("userConnected", (user) => {
        console.log(user, operators)

        if (user.roles.includes("operator")) {
            const alreadyOnList = operators.find((operator) => operator._id === user._id)

            if (alreadyOnList) {
                return false
            }

            setOperators((prev) => [...prev, user])
        }
    })

    window.app.ws.listen("userDisconnected", (user_id) => {
        if (user.roles.includes("operator")) {
            setOperators((prev) => prev.filter((operator) => operator._id !== user_id))
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