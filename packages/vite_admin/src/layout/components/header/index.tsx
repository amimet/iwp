import React from 'react'
import * as antd from 'antd'
import classnames from 'classnames'
import Breadcrumb from '../breadcrumb'

export default class Header extends React.Component {
    state = {
        loadingSearch: false,
        hidden: false
    }

    componentDidMount() {
        window.hideHeader = () => {
            this.setState({ hidden: !this.state.hidden })
        }
    }

    render() {
        window.headerVisible = !this.state.hidden

        return (
            <antd.Layout.Header className={classnames(`app_header`, { ["hidden"]: this.state.hidden })} >
                <Breadcrumb />
                <antd.Input.Search className="app_searchBar" placeholder="Search on app..." loading={this.state.loadingSearch} />
            </antd.Layout.Header>
        )
    }
}