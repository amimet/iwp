import React from 'react'

export default {
    key: "connect",
    expose: [
        {
            initialization: [
                async (app, main) => {
                    main.connectWithApp = (component) => {
                        return React.createElement(component, { app: app })
                    }

                    main.setToWindowContext("connect", app.connectWithApp)
                },
            ],
        },
    ],
}