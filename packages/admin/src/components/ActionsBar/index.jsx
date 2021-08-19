import React from 'react'
import { Card } from 'antd'

import './index.less'

export default (props) => {
    const { children } = props

    return <Card style={{ borderRadius: "8px", ...props.style }} >
        <div className="actionsBar_flexWrapper">
            {children}
        </div>
    </Card>
}