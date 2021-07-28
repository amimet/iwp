import Login from 'pages/login'

export function openLoginDrawer(){
    window.controllers.drawer.open(Login, {
        componentProps: {
            onDone: () => window.controllers.drawer.close(),
        },
        props: {
            width: "45%",
        },
    })
}