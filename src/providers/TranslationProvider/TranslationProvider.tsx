import * as React from 'react'

import { Loader } from 'decentraland-ui'
import TranslationSetup from './TranslationSetup'
import {
  I18nProvider,
  addAvailableLocaleData
} from '../../modules/translation/utils'
import { Props } from './TranslationProvider.types'

export default class TranslationProvider extends React.PureComponent<Props> {
  componentWillMount() {
    addAvailableLocaleData()
  }

  componentWillReceiveProps(nextProps: Props) {
    const { locale, onFetchTranslations } = nextProps

    if (locale && this.props.locale !== locale) {
      onFetchTranslations(locale)
    }
  }

  renderLoading() {
    return <Loader active size="massive" />
  }

  render() {
    const { children, locale, translations } = this.props

    return translations ? (
      <I18nProvider locale={locale} messages={translations}>
        <React.Fragment>
          <TranslationSetup />
          {children}
        </React.Fragment>
      </I18nProvider>
    ) : (
      this.renderLoading()
    )
  }
}
