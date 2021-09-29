import React from 'react'

export default {
    key: "connect",
    expose: [
        {
            attachToInitializer: [
                async (self) => {
                    self.connectWithApp = (component) => {
                        return React.cloneElement(component, self)
                    }
                },
            ],
        },
    ],
}