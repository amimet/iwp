import packagejson from '../package.json'
import defaultTheme from "../constants/defaultTheme.json"

export default {
    defaultTheme,
    logo: {
        alt: new URL(`../src/assets/logo_alt.svg`, import.meta.url).href
    },
    api: {
        address: process.env.NODE_ENV !== 'production'? `http://${window.location.hostname}:3000` : "https://api.amimet.es",
    },
    ws: {
        address: process.env.NODE_ENV !== 'production'? `ws://${window.location.hostname}:3001` : "https://ws.amimet.es",
    },
    app: {
        title: packagejson.name,
        siteName: "AmimetApp",
        mainPath: '/main',
        storage: {
            basics: "user",
            token: "token",
            session_frame: "session",
            signkey: "certified",
            settings: "app_settings"
        },
    },
    indexer: [
        {
            match: '/s;:id',
            to: `/settings?key=:id`,
        },
        {
            match: '/@:id',
            to: `/@/:id`,
        }
    ],
    i18n: {
        languages: [
            {
                key: 'en',
                title: 'English',
            },
            {
                key: 'es',
                title: 'Español',
            }
        ],
        defaultLanguage: 'en',
    }
}