import packagejson from '../package.json'

export default {
    logo: {
        alt: `${window.location.origin}/src/assets/logo_alt.svg`
    },
    api: {
        address: process.env.NODE_ENV !== 'production'? `http://${window.location.hostname}:3000` : "https://api.amimet.es",
    },
    ws: {
        address: process.env.NODE_ENV !== 'production'? `ws://${window.location.hostname}:3001` : "https://ws.amimet.es",
    },
    theme: {
        "primary-color": "#32b7bb",
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
    defaults: {
        avatar: "https://www.flaticon.com/svg/static/icons/svg/149/149071.svg"
    },
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