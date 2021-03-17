const handlers = {
    settings: {
        test1: {
            enable: () => {
                console.log("test1 fn() => enabling")
            },
            disable: () => {
                console.log("test1 fn() => DISABLED")
            },
            click: () => {
                console.log("test1 fn() => CLICKED, UNIQUE FN")
            }
        }
    }
}

export default handlers