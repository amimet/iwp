import React from 'react'
import * as antd from 'antd'
import classnames from 'classnames'

import "./index.less"

export default class Header extends React.Component {
    state = {
        loadingSearch: false,
        visible: true
    }

    componentDidMount() {
        window.toogleHeader = (to) => {
            this.setState({ visible: to ?? !this.state.visible })
        }
    }

    render() {
        window.headerVisible = this.state.visible

        return (
            <antd.Layout.Header className={classnames(`app_header`, { ["hidden"]: !this.state.visible })} >
                <antd.Input.Search className="app_searchBar" placeholder="Search on app..." loading={this.state.loadingSearch} />
            </antd.Layout.Header>
        )
    }
}