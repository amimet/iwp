import Login from 'pages/login'

export function openLoginDrawer(){
    window.controllers.drawer.open("login", Login, {
        locked: true,
        componentProps: {
            onDone: () => window.controllers.drawer.close(),
        },
        extend: [
            (self) => {
                self.onDone = () => {
                    self.close()
                }
            },
        ],
        props: {
            closable: false,
            width: "45%",
        },
    })
}