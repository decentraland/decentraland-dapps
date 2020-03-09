import { takeEvery, put, call, ForkEffect } from 'redux-saga/effects'
import flatten from 'flat'
import { Translation, TranslationKeys } from './types'
import {
  fetchTranslationsSuccess,
  fetchTranslationsFailure,
  FETCH_TRANSLATIONS_REQUEST,
  FetchTranslationsRequestAction
} from './actions'
import { setCurrentLocale, mergeTranslations } from './utils'
import * as defaultTranslations from './defaults'

export type TranslationSagaOptions = {
  getTranslation?: (locale: string) => Promise<Translation>
  translations?: { [locale: string]: Translation }
}

export function createTranslationSaga({
  getTranslation,
  translations
}: TranslationSagaOptions): () => IterableIterator<ForkEffect> {
  function* handleFetchTranslationsRequest(
    action: FetchTranslationsRequestAction
  ) {
    try {
      const { locale } = action.payload
      let result
      if (getTranslation) {
        result = yield call(() => getTranslation(locale))
      } else if (translations) {
        result = translations[locale]
      } else {
        throw new Error('You must provide `translations` or `getTranslations`')
      }

      // merge translations and defaults
      result = mergeTranslations<TranslationKeys>(
        flatten(defaultTranslations[locale]),
        flatten(result)
      )

      setCurrentLocale(locale, result)

      yield put(fetchTranslationsSuccess(locale, result))
    } catch (error) {
      yield put(fetchTranslationsFailure(error.message))
    }
  }

  return function* translationSaga() {
    yield takeEvery(FETCH_TRANSLATIONS_REQUEST, handleFetchTranslationsRequest)
  }
}
