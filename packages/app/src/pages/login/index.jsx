import React from 'react'
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
    static bindApp = ["sessionController"]

    handleFinish = async (values, ref) => {
        ref.toogleValidation(true)
        
        const payload = {
            username: values.username,
            password: values.password,
            allowRegenerate: values.allowRegenerate,
        }

        this.props.contexts.app.sessionController.login(payload, (err, res) => {
            ref.toogleValidation(false)
            ref.clearErrors()

            if (err) {
                try {
                    if (res.status !== 401) {
                        ref.error("result", `${err}`)
                    }
                    ref.error("all", `${err}`)
                } catch (error) {
                    ref.error("result", `${error}`)
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
                    onFinish={this.handleFinish}
                />
            </div>
        )
    }
}