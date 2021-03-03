const packagejson = require("../package.json")

module.exports = {
    logo: {
        alt: "https://dl.amimet.es/branding/amimet_alt/SVG/index.svg"
    },
    app: {
        title: packagejson.name,
        app_model: "app",
        defaultStyleClass: "app_",
        defaultTransitionPreset: "moveToLeftFromRight",
        mainPath: '/main',
        api_hostname: "https://api.amimet.es",

        storage: { // specify where data is storaged
            session_frame: "session",
            signkey: "certified",
            settings: "app_settings"
        },

        certified_signkeys: [
            "f706b0a535b6c2d36545c4137a0a3a26853ea8b5-1223c9ba7923152cae28e5a2e7501b2b-50600768"
        ] // get from external resolver
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
    },
    layouts: [
        {
            name: 'base',
            include: [/.*/]
        },
    ],
}