import React from 'react'
import { Menu, Avatar } from 'antd'

export default (props) => {
    return <div className="accountSidebarComponent">
        <Avatar src={props.avatar} />
    </div>
}