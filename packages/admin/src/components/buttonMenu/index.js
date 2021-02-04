import React from 'react'
import * as antd from 'antd'
import * as Icons from 'components/Icons'
import { FormattedMessage } from 'react-intl'

export default class ButtonMenu extends React.Component {
    state = {
        menus: this.props.menus, // remains set filter query
        secondMenu: this.props.secondaryMenus
    }

    handleClickMenu(id) {
        const element = document.getElementById(id)
        if (typeof (element) !== "undefined") {
            try {
                element.focus()
            } catch (error) {
                console.log(error)
            }
        }
        if (typeof(this.props.onClick) !== "undefined") {
            this.props.onClick(id)
        }
    }

    renderMenus() {
        if (this.state.menus) {
            return this.state.menus.map((e) => {
                return <antd.Button onClick={() => this.handleClickMenu(e.id)} id={e.id ?? Math.random} key={e.id} className={window.classToStyle("indexMenuItem")}>
                    <div className="icon">{e.icon ? React.createElement(Icons[e.icon], { style: e.iconStyle ?? null }) : null}</div>
                    <div className="title"><FormattedMessage id={e.title} defaultMessage={e.title} /></div>
                </antd.Button>
            })
        }
    }

    renderSecondaryMenus() {
        if (this.state.secondMenu) {
            return this.state.secondMenu.map((e) => {
                return <antd.Button onClick={() => this.handleClickMenu(e.id)} id={e.id ?? Math.random} key={e.id} className={window.classToStyle("indexMenuItem")}>
                    <div className="icon">{e.icon ? React.createElement(Icons[e.icon], { style: e.iconStyle ?? null }) : null}</div>
                    <div className="title"><FormattedMessage id={e.title} defaultMessage={e.title} /></div>
                </antd.Button>
            })
        }
    }

    render() {
        return (
            <div>
                <div className={window.classToStyle("indexMenu")} >
                    {this.renderMenus()}
                </div>
                <div className={window.classToStyle("indexMenuBottom")}>
                    {this.renderSecondaryMenus()}
                </div>
            </div>
        )
    }
}