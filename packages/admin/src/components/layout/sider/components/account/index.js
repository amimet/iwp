import { Menu, Avatar } from 'antd'

export default (props) => {
    return <Menu.Item id={props.username} className={window.classToStyle("usernameSidebarComponent")} key={props.username}>
        <Avatar src={props.avatar} />
    </Menu.Item>
}