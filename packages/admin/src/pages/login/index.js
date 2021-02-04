import React from 'react'
import { connect } from 'umi'
import * as antd from 'antd'
import { FormGenerator } from 'components'
import { FormattedMessage, FormattedNumber } from 'react-intl'


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
