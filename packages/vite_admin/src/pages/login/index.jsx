import React from 'react'
import { FormGenerator } from 'components'
import * as session from 'core/models/session'

const formInstance = [
    {
        id: "username",
        formElement: {
            element: "Input",
            icon: "User",
            placeholder: "Username",
            props: null
        },
        formItem: {
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
        formElement: {
            element: "Input",
            icon: "Lock",
            placeholder: "Password",
            props: {
                type: "password"
            }
        },
        formItem: {
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
        formElement: {
            element: "Button",
            props: {
                icon: "User",
                children: "Login",
                type: "primary",
                htmlType: "submit"
            }
        }
    }
]

export default class Login extends React.Component {
    async handleSend(values) {
        console.log(this.props)
        session.handleLogin(this.props.api, values, (err, res) => {
            window.currentForms["normal_login"].toogleValidation(false)
            window.currentForms["normal_login"].clearErrors()

            if (err) {
                try {
                    if (res.status !== 401) {
                        window.currentForms["normal_login"].handleFormError("result", `${err}`)
                    }
                    window.currentForms["normal_login"].handleFormError("all", `${err}`)
                } catch (error) {
                    window.currentForms["normal_login"].handleFormError("result", `${error}`)
                }
            }else {
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

    componentDidMount() {
        if (window.headerVisible) {
            window.toogleHeader(false)
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