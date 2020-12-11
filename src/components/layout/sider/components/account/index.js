import { Menu, Avatar } from 'antd' 

export default (props) => {
    return <Menu.Item key="account">
    <Avatar src={props.Avatar} /> @{props.username ?? "account"}
</Menu.Item>  
}