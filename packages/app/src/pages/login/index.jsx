import React from 'react'
import * as antd from 'antd'
import { FormGenerator } from 'components'

const formInstance = [
    {
        id: "username",
        element: {
            component: "Input",
            icon: "User",
            placeholder: "Username",
            props: null
        },
        item: {
            hasFeedback: true,
            rules: [
                {
                    required: true,
                    message: 'Please input your Username!',
                },
            ],
            props: null
        }
    },
    {
        id: "password",
        element: {
            component: "Input",
            icon: "Lock",
            placeholder: "Password",
            props: {
                type: "password"
            }
        },
        item: {
            hasFeedback: true,
            rules: [
                {
                    required: true,
                    message: 'Please input your Password!',
                },
            ],
        }
    },
    {
        id: "login_btn",
        withValidation: true,
        element: {
            component: "Button",
            props: {
                icon: "User",
                children: "Login",
                type: "primary",
                htmlType: "submit"
            }
        }
    },
    {
        id: "allowRegenerate",
        withValidation: false,
        element: {
            component: "Checkbox",
            props: {
                children: "Not expire",
                defaultChecked: false,
            }
        }
    }
]

export default class Login extends React.Component {
    static connectContext = ["sessionController"]

    async handleSend(values) {
        const payload = {
            username: values.username,
            password: values.password,
            allowRegenerate: values.allowRegenerate,
        }

        this.props.sessionController.login(payload, (err, res) => {
            window.currentForms["normal_login"].toogleValidation(false)
            window.currentForms["normal_login"].clearErrors()
            console.log(res)
            if (err) {
                try {
                    if (res.status !== 401) {
                        window.currentForms["normal_login"].handleFormError("result", `${err}`)
                    }
                    window.currentForms["normal_login"].handleFormError("all", `${err}`)
                } catch (error) {
                    window.currentForms["normal_login"].handleFormError("result", `${error}`)
                }
            } else {
                if (res.status === 200) {
                    this.onDone()
                }
            }
        })
    }

    onDone = () => {
        if (typeof this.props.onDone === "function") {
            this.props.onDone()
        }
    }

    componentWillUnmount() {
        window.app.SidebarController.toogleVisible(true)
        window.app.HeaderController.toogleVisible(true)
    }

    componentDidMount() {
        if (window.app.SidebarController.isVisible()) {
            window.app.SidebarController.toogleVisible(false)
        }

        if (window.app.HeaderController.isVisible()) {
            window.app.HeaderController.toogleVisible(false)
        }
    }

    render() {
        return (
            <div className="app_login">
                <FormGenerator
                    name="normal_login"
                    renderLoadingIcon
                    className="login-form"
                    items={formInstance}
                    onFinish={(...context) => {
                        window.currentForms["normal_login"].toogleValidation(true)
                        this.handleSend(...context)
                    }}
                />
            </div>
        )
    }
}