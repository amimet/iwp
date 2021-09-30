import React from 'react'

export default {
    key: "connect",
    expose: [
        {
            attachToInitializer: [
                async (self) => {
                    self.connectWithApp = (component) => {
                        return React.createElement(component, { app: self })
                    }

                    self.appendToApp("connect", self.connectWithApp)
                },
            ],
        },
    ],
}