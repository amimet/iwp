import React from 'react'
import less from "less"

export default () => {
    function getLessVars() {
        return less.getVars()
    }

    return <div>
        <h4>Current Variables</h4>
        {JSON.stringify(getLessVars(), null, 2)}
    </div>
}