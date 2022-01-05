import * as React from 'react'

import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { I18nProvider } from '../../modules/translation/utils'
import { Props } from './TranslationProvider.types'

export default class TranslationProvider extends React.PureComponent<Props> {
  componentDidUpdate(prevProps: Props) {
    const { locale, onFetchTranslations } = this.props

    if (locale && prevProps.locale !== locale) {
      onFetchTranslations(locale)
    }
  }

  renderLoading() {
    return <Loader active size="massive" />
  }

  render() {
    const { children, locale, translations } = this.props

    return translations && locale ? (
      <I18nProvider key={locale} locale={locale} messages={translations}>
        {children}
      </I18nProvider>
    ) : (
      this.renderLoading()
    )
  }
}
