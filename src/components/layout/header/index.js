import React from 'react'
import * as antd from 'antd'
import classnames from 'classnames'

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

    renderHeaderBack() {
        if (window.location.pathname !== this.props.originPath) {
            return <span onClick={() => this.props.handleBack()} style={{ cursor: "pointer", marginRight: "14px", backgroundColor: "#333", color: "#fff", borderRadius: "4px", padding: "2px 10px" }}>
                <Icons.ChevronLeft />
                <FormattedMessage id="Back" defaultMessage="Back" />
            </span>
        }
        return null
    }

    renderHeaderTextDecorator() {
        if (window.location.pathname !== this.props.originPath) {
            return `${window.location.pathname}`
        }
        return `${this.props.siteName}`
    }
    
    renderContent() {
        if (this.state.hidden) {
            return null
        }
        return <div>{this.renderHeaderBack()}</div>
    }

    render() {
        window.headerVisible = !this.state.hidden
        
        return (
            <antd.Layout.Header className={classnames(window.classToStyle("header"), { ["hidden"]: this.state.hidden })} >
                <antd.Input.Search className={window.classToStyle("searchBar")} placeholder="Search on app..." loading={this.state.loadingSearch} />
                {this.renderContent()}
            </antd.Layout.Header>
        )
    }
}