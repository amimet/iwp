import React from 'react'
import { connect } from 'umi'
import * as antd from 'antd'
import { FormGenerator } from 'components'
import { FormattedMessage, FormattedNumber } from 'react-intl'


const loginItems = [
    {
        id: "username",
        type: {
            element: "Input",
            icon: "User",
            placeholder: "Username",
            props: null
        },
        form: {
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
        type: {
            element: "Input",
            icon: "Lock",
            placeholder: "Password",
            props: {
                type: "password"
            }
        },
        form: {
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
        type: {
            element: "Button",
            props: {
                icon: "User",
                children: <FormattedMessage id="Login" defaultMessage="Login" />,
                type: "primary",
                htmlType: "submit"
            }
        }
    }
]

@connect(({ app }) => ({ app }))
export default class Login extends React.Component {

    handleSend(values) {
        this.props.dispatch({
            type: "app/login",
            payload: values,
            callback: (err, res) => {
                window.currentForms["normal_login"].toogleValidation(false)
                if (err) {
                    try {
                        if (res.code == 110) {
                            window.currentForms["normal_login"].handleFormError("all", "Invalid credentials")
                        } else {
                            window.currentForms["normal_login"].handleFormError("result", `${res}`)
                        }
                    } catch (error) {
                        window.currentForms["normal_login"].handleFormError("result", `${error}`)
                    }
                }
            }
        })
    }

    componentDidMount() {
        if (window.headerVisible) {
            window.hideHeader()
        }
    }

    render() {
        return (
            <div className={window.classToStyle("login")}>
                <FormGenerator
                    name="normal_login"
                    className="login-form"
                    items={loginItems}
                    onFinish={(...context) => {
                        window.currentForms["normal_login"].toogleValidation(true)
                        this.handleSend(...context)
                    }}
                />
            </div>
        )
    }
}
