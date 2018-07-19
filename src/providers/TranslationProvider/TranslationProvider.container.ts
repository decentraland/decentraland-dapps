import { connect } from 'react-redux'
import { getLocale } from '../../modules/wallet/selectors'
import { isLoading } from '../../modules/storage/selectors'
import { getData } from '../../modules/translation/selectors'
import { fetchTranslationsRequest } from '../../modules/translation/actions'
import { getPreferredLocale } from '../../modules/translation/utils'
import { TranslationActions } from '../../modules/translation/types'
import { TranslationProviderProps } from './types'
import { RootDispatch } from '../../types'
import TranslationProvider from './TranslationProvider'

const mapState = (
  state: any,
  ownProps: TranslationProviderProps
): TranslationProviderProps => {
  // Wait until the locale is loaded from the storage to select it
  let locale = isLoading(state) ? '' : getLocale(state) || getPreferredLocale()
  let translations
  const translationsInState = getData(state)[locale]
  if (translationsInState) {
    translations = translationsInState
  }
  return {
    ...ownProps,
    locale,
    translations
  }
}

const mapDispatch = (dispatch: RootDispatch<TranslationActions>) => ({
  onFetchTranslations: (locale: string) =>
    dispatch(fetchTranslationsRequest(locale))
})

export default connect(mapState, mapDispatch)(TranslationProvider as any) as any
