import React from 'react'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import * as Icons from 'feather-reactjs'
import classnames from 'classnames'

export default class Header extends React.Component {
    state = {
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
        return <div>{this.renderHeaderBack()} {this.renderHeaderTextDecorator()}</div>
    }

    render() {
        window.headerVisible = !this.state.hidden
        
        return (
            <div className={classnames(window.classToStyle("header"), { ["hidden"]: this.state.hidden })}>
                {this.renderContent()}
            </div>
        )
    }
}