import Login from 'pages/login'

export function openLoginDrawer(){
    window.controllers.drawer.open("login", Login, {
        locked: true,
        onDone: (self) => {
            self.close()
        },
        props: {
            closable: false,
            width: "45%",
        },
    })
}