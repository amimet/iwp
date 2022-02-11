import packagejson from "../package.json"
import defaultTheme from "../constants/defaultTheme.json"
import defaultSoundPack from "../constants/defaultSoundPack.json"

export default {
    package: packagejson,
    defaultTheme: defaultTheme,
    defaultSoundPack: defaultSoundPack,
    author: "RageStudio© 2022",
    logo: {
        alt: "/logo_alt.svg"
    },
    api: {
        address: process.env.NODE_ENV !== "production" ? `http://${window.location.hostname}:3000` : process.env.HTTP_API_ADDRESS,
    },
    ws: {
        address: process.env.NODE_ENV !== "production" ? `ws://${window.location.hostname}:3001` : process.env.WS_API_ADDRESS,
    },
    app: {
        title: packagejson.name,
        siteName: "AmimetApp",
        mainPath: "/main",
        storage: {
            basics: "user",
            token: "token",
            session_frame: "session",
            signkey: "certified",
            settings: "app_settings"
        },
    },
    i18n: {
        languages: [
            {
                locale: "en",
                name: "English"
            },
            {
                locale: "es",
                name: "Español"
            }
        ],
        defaultLocale: "es",
    }
}