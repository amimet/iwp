import React from 'react'
import * as Icons from 'components/Icons'
import { Layout, Menu } from 'antd'
import withConnector from 'core/libs/withConnector'

const { Sider } = Layout
const { SubMenu } = Menu

@withConnector
export default class Sidebar extends React.Component {
    
    state = {
        theme: this.props.app.activeTheme ?? "light"
    }

    render() {
        return (
            <Sider theme={this.state.theme} collapsible collapsed={this.props.collapsed} onCollapse={() => this.props.onCollapse()}>
                <Menu theme={this.state.theme} defaultSelectedKeys={['1']} mode="inline">
                    <Menu.Item key="1" icon={<Icons.PieChartOutlined />}>
                        Option 1
                </Menu.Item>
                    <Menu.Item key="2" icon={<Icons.DesktopOutlined />}>
                        Option 2
                </Menu.Item>
                    <SubMenu key="sub1" icon={<Icons.UserOutlined />} title="User">
                        <Menu.Item key="3">Tom</Menu.Item>
                        <Menu.Item key="4">Bill</Menu.Item>
                        <Menu.Item key="5">Alex</Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub2" icon={<Icons.TeamOutlined />} title="Team">
                        <Menu.Item key="6">Team 1</Menu.Item>
                        <Menu.Item key="8">Team 2</Menu.Item>
                    </SubMenu>
                    <Menu.Item key="9" icon={<Icons.FileOutlined />}>
                        Files
                </Menu.Item>
                </Menu>
            </Sider>
        )
    }
}