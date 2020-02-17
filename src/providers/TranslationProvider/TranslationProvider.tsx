import * as React from 'react'

import { Loader } from 'decentraland-ui'
import { I18nProvider } from '../../modules/translation/utils'
import { Props } from './TranslationProvider.types'

export default class TranslationProvider extends React.PureComponent<Props> {
  UNSAFE_componentWillReceiveProps(nextProps: Props) {
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

    return translations && locale ? (
      <I18nProvider locale={locale} messages={translations}>
        {children}
      </I18nProvider>
    ) : (
      this.renderLoading()
    )
  }
}
