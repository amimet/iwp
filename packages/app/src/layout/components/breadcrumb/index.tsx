import React from 'react'
import * as antd from 'antd'
import { Icons } from 'components/icons'
import pathDecorators from 'schemas/pathDecorators.json'

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
                } else {
                    if (splitedPathnames[0] == e) {
                        return React.createElement(Icons["Home"])
                    }
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

            function isFirst(e) {
            }

            return splitedPathnames.map((e) => {
                return <antd.Breadcrumb.Item key={e}>{isFirst(e) ? <Icons.Home /> : null} {getIcon(e)} {getDecorator(e)}</antd.Breadcrumb.Item>
            })
        } catch (error) {
            return null
        }
    }

    render() {
        return (
            <antd.Breadcrumb>
                {this.renderFromPath()}
            </antd.Breadcrumb>
        )
    }
}