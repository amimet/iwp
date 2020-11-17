const packagejson = require("../package.json")

module.exports = {
    app: {
        title: packagejson.name,
        defaultStyleClass: "app_",
        defaultTransitionPreset: "moveToLeftFromRight",
        mainPath: '/main',
        api_hostname: "http://192.168.137.78:3000",

        storage: { // specify where data is storaged
            session_frame: "session",
            signkey: "certified"
        },
        
        certified_signkeys: [
            "f706b0a535b6c2d36545c4137a0a3a26853ea8b5-1223c9ba7923152cae28e5a2e7501b2b-50600768"
        ] // get from external resolver

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
            },
            {
                key: 'ar',
                title: 'Arabian',
            },
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