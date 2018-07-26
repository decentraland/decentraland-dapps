import { takeEvery, put, call, ForkEffect } from 'redux-saga/effects'
import * as flatten from 'flat'
import {
  FETCH_TRANSLATIONS_REQUEST,
  FetchTranslationRequest,
  Translation
} from './types'
import { fetchTranslationsSuccess, fetchTranslationsFailure } from './actions'
import { setCurrentLocale } from './utils'

export type TranslationSagaOptions = {
  getTranslation?: (locale: string) => Promise<Translation>
  translations?: { [locale: string]: Translation }
}

export function createTranslationSaga({
  getTranslation,
  translations
}: TranslationSagaOptions): () => IterableIterator<ForkEffect> {
  function* handleFetchTranslationsRequest(action: FetchTranslationRequest) {
    try {
      const { locale } = action.payload
      let result
      if (getTranslation) {
        result = yield call(() => getTranslation(locale))
      } else if (translations) {
        result = flatten(translations[locale])
      } else {
        throw new Error(
          'You must provide `allTranslations` or `getTranslations`'
        )
      }

      setCurrentLocale(locale)

      yield put(fetchTranslationsSuccess(locale, result))
    } catch (error) {
      yield put(fetchTranslationsFailure(error.message))
    }
  }
  return function* translationSaga() {
    yield takeEvery(FETCH_TRANSLATIONS_REQUEST, handleFetchTranslationsRequest)
  }
}
