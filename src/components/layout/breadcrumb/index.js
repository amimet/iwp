import React from 'react'
import * as antd from 'antd'
import * as Icons from 'components/Icons'

const pathDecorators = {
    main: {
        icon: "Home",
        title: "Main"
    }
}

export default class Breadcrumb extends React.Component {

    renderFromPath() {
        try {
            const path = window.location.pathname
            let splitedPathnames = path.split("/")
            splitedPathnames = splitedPathnames.slice(1, splitedPathnames.length)

            function getIcon(e) {
                const fromDecorator = pathDecorators[e]

                if (typeof (fromDecorator) !== "undefined") {
                    if (typeof (fromDecorator.icon) !== "undefined") {
                        return React.createElement(Icons[fromDecorator.icon])
                    }
                    return null
                }

                return null
            }

            function getDecorator(e) {
                const fromDecorator = pathDecorators[e]

                if (typeof (fromDecorator) !== "undefined") {
                    return fromDecorator.title ?? "Item"
                }

                return `${e}`
            }

            return splitedPathnames.map((e) => {
                return <antd.Breadcrumb.Item key={e}>{getIcon(e)} {getDecorator(e)}</antd.Breadcrumb.Item>
            })
        } catch (error) {
            return null
        }
    }

    render() {
        return (
            <antd.Breadcrumb style={{ margin: '16px 0' }}>
                { this.renderFromPath()}
            </antd.Breadcrumb>
        )
    }
}