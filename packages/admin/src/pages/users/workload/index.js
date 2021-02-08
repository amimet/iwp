import React from 'react'
import { LoadingSpinner } from 'components'

export default class Workload extends React.Component{
    state = {
        loading: true,
        regions: null
    }

    componentDidMount() {
        window.dispatcher({
            type: "api/request",
            payload: {
                method: "GET",
                endpoint: "regions"
            },
            callback: (err, res) => {
                if (err) {
                    return false
                }
                this.setState({ loading: false, regions: res })
            }
        })
    }

    renderRegions() {
        return this.state.regions.map((region) => {
            return <div>
                {region.data.title}
            </div>
        })
    }

    render() {
        if (this.state.loading) return <LoadingSpinner />

        return <div>
            {this.renderRegions()}
        </div>
    }
}