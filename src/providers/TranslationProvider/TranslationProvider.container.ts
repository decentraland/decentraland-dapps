import { connect } from 'react-redux'

import { Locale } from 'decentraland-ui/dist/components/Language/Language'

import TranslationProvider from './TranslationProvider'
import {
  MapStateProps,
  MapDispatchProps,
  OwnProps
} from './TranslationProvider.types'
import { isLoading } from '../../modules/storage/selectors'
import { getData, getLocale } from '../../modules/translation/selectors'
import { fetchTranslationsRequest } from '../../modules/translation/actions'
import { getPreferredLocale } from '../../modules/translation/utils'
import { RootDispatch } from '../../types'

const mapState = (state: any, ownProps: OwnProps): MapStateProps => {
  // Wait until the locale is loaded from the storage to select it
  let locale
  let translations

  if (!isLoading(state)) {
    locale =
      getLocale(state) ||
      getPreferredLocale(ownProps.locales) ||
      ownProps.locales[0]
    if (locale) {
      const translationsInState = getData(state)[locale]
      if (translationsInState) {
        translations = translationsInState
      }
    }
  }

  return {
    locale: locale as Locale,
    translations
  }
}

const mapDispatch = (dispatch: RootDispatch): MapDispatchProps => ({
  onFetchTranslations: (locale: Locale) =>
    dispatch(fetchTranslationsRequest(locale))
})

export default connect(
  mapState,
  mapDispatch
)(TranslationProvider) as any
