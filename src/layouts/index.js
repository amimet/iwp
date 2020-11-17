import React from 'react'
import Base from './base'
import { withRouter, connect } from 'umi'

import { Helmet } from 'react-helmet'
import { queryLayout, getLocale, defaultLanguage } from 'core'
import config from 'config'
import { IntlProvider } from 'react-intl'

const LayoutMap = {
    base: Base
}

const langToLocale = {
    es: "es_ES",
    en: "en_US"
}

let languages = [
    "es", "en"
]

@withRouter
@connect(({ app }) => ({ app }))
export default class Layout extends React.Component {
    state = {
        done: false,
        language: getLocale(),
        lang: {}
    }

    componentDidMount() {
        this.loadLanguage(this.state.language)
    }

    loadLanguage = async (language) => {
        if (typeof (language) !== "undefined") {
            this.setState({ done: false })
            try {
                if (!languages.includes(language)) {
                    throw new Error(`Locale [${language}] not exist`)
                }
                const lang = await require(`../locales/${language}.js`).default
                if (lang) {
                    this.setState({ lang, done: true })
                }
            } catch (error) {
                this.setState({ done: true })
                console.log(error)
            }
        }
    }

    render() {
        const { children, location } = this.props
        const { language, lang, done } = this.state

        if (!done) {
            return null
        }
        const Container = LayoutMap[queryLayout(config.layouts, location.pathname)]
        return (
            <React.Fragment>
                <Helmet>
                    <title>{config.app.siteName}</title>
                </Helmet>
                <IntlProvider messages={lang} locale={language} >
                    <Container>{children}</Container>
                </IntlProvider>
            </React.Fragment >
        )
    }
}