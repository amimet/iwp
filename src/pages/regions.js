import * as antd from 'antd'
import React from 'react'
import withConnector from 'core/libs/withConnector'
import GoogleMap from 'components/googleMap'

@withConnector
export default class Geo extends React.Component {
    state = {
        data: []
    }

    componentDidMount() {
        window.dispatcher({
            type: "api/request",
            payload: {
                method: "GET",
                endpoint: "regions"
            },
            callback: (err, res) => {
                if (!err) {
                    this.setState({ data: res.data })
                }
            }
        })
    }

    renderRegions(items) {
        if (!items || !Array.isArray(items)) {
            console.warn(`Invalid items recived > ${typeof (items)}`)
            return null
        }
        return items.map((item) => {
            return <div key={item.id} className={window.classToStyle("regions_card")} >
                <div style={{ float: "left" }}>
                    <antd.Tag>#{item.id}</antd.Tag>
                    <h1>
                        {item.data.title}
                    </h1>
                </div>
                <div style={{ float: "right" }}>
                    {GoogleMap({
                        zoom: 15,
                        lat: item.geo.lat,
                        lng: item.geo.lng,
                        markerText: item.data.name
                    })}
                </div>
            </div>
        })
    }

    render() {
        if (!this.state.data) {
            return <div> Loading... </div>
        }
        return (
            <div className={window.classToStyle("regions_wrapper")} >
                { this.renderRegions(this.state.data)}
            </div>
        )
    }
}