import React from 'react'

export default {
    key: "connect",
    expose: [
        {
            initialization: [
                async (app, main) => {
                    app.connectWithApp = (component) => {
                        if (React.isValidElement(component)) {
                          return React.cloneElement(component, {app})  
                        }

                        return React.createElement(component, { app: app })
                    }

                    main.setToWindowContext("connect", app.connectWithApp)
                },
            ],
        },
    ],
}