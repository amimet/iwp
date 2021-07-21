import React from 'react'
import { LoadingSpinner } from 'components'

export default class Workload extends React.Component{
    state = {
        loading: true,
        regions: null
    }

    componentDidMount = async () => {
        // TODO: fecth from api
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