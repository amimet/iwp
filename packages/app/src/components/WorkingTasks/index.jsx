import React from "react"
import * as antd from "antd"
import { Translation } from "react-i18next"

import { Icons } from "components/Icons"

import "./index.less"

export default class WorkingTasks extends React.Component {
    state = {
        tasks: []
    }
    api = window.app.request

    componentDidMount = async () => {
        await this.fetchWorkingTasks()

        // TODO: add ws join & leave events
    }

    fetchWorkingTasks = async () => {
        const result = await this.api.get.activeTasks().catch((error) => {
            console.error(error)
            antd.message.error(error.message)
            return false
        })

        if (result) {
            this.setState({ tasks: result })
        }
    }

    openTask = (uuid) => {
        window.app.openWorkloadInspector(uuid)
    }

    renderTasks = () => {
        return this.state.tasks.map((task) => {
            return <div className="task" onClick={() => { this.openTask(task.uuid) }}>
                {task.uuid}
            </div>
        })
    }

    render() {
        return <div className="workingTasks">
            <h2><Icons.MdHistory /> <Translation>{
                t => t("Working Tasks")
            }</Translation></h2>

            <div className="list">
                {this.state.tasks.length > 0 ? this.renderTasks() : <Translation>{
                    t => <p>{t("You are not working on any task")}</p>
                }</Translation>}
            </div>
        </div>
    }
}