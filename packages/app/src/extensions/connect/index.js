import React from 'react'

export default {
    key: "connect",
    expose: [
        {
            initialization: [
                async (app, main) => {
                    app.connectedContext = (component) => {
                        let elementProps = {}

                        if (Array.isArray(component.connectContext)) {
                            component.connectContext.forEach((contextKey) => {
                                elementProps[contextKey] = app[contextKey]
                            })
                        }

                        return (props) => React.createElement(component, { ...props, ...elementProps })
                    }

                    main.setToWindowContext("connect", app.connectedContext)
                },
            ],
        },
    ],
}