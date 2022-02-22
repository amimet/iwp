import React from "react"
import * as antd from "antd"
import { Translation } from "react-i18next"

import { User } from "models"
import { Icons } from "components/Icons"

import "./index.less"

export default class ActiveTasks extends React.Component {
    state = {
        tasks: []
    }
    api = window.app.request

    componentDidMount = async () => {
        await this.fetchWorkingTasks()

        const userId = await User.selfUserId()

        window.app.ws.listen(`task.join.userId.${userId}`, (data) => {
            let tasks = this.state.tasks

            tasks.push(data.task)

            this.setState({
                tasks: tasks
            })
        })

        window.app.ws.listen(`task.leave.userId.${userId}`, (data) => {
            let tasks = this.state.tasks

            tasks = tasks.filter((task) => task._id !== data.task._id)

            this.setState({
                tasks: tasks
            })
        })
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
            return <div key={task.target_id} className="task" onClick={() => { this.openTask(task.target_id) }}>
                <Icons.Box />
                {task.target_id}
            </div>
        })
    }

    render() {
        return <div className="workingTasks">
            <antd.Badge offset={[10, 0]} count={this.state.tasks.length ?? 0}>
                <h2><Icons.MdHistory /> <Translation>{
                    t => t("Working Tasks")
                }</Translation> </h2>
            </antd.Badge>

            <div className="list">
                {this.state.tasks.length > 0 ? this.renderTasks() : <Translation>{
                    t => <p>{t("You are not working on any task")}</p>
                }</Translation>}
            </div>
        </div>
    }
}