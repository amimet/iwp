import packagejson from '../package.json'

export default {
    logo: {
        alt: "https://dl.amimet.es/branding/amimet_alt/SVG/index.svg"
    },
    api: {
        address: process.env.NODE_ENV !== 'production'? "http://localhost:3000" : "https://api.amimet.es",
    },
    app: {
        title: packagejson.name,
        siteName: "AmimetApp",
        mainPath: 'main',
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