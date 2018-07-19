import { takeEvery, put, call, ForkEffect } from 'redux-saga/effects'
import {
  FETCH_TRANSLATIONS_REQUEST,
  FetchTranslationRequest,
  Translation
} from './types'
import { fetchTranslationsSuccess, fetchTranslationsFailure } from './actions'
import { setCurrentLocale } from './utils'

export type TranslationSagaOptions = {
  getTranslation: (locale: string) => Promise<Translation>
}

export function createTranslationSaga({
  getTranslation
}: TranslationSagaOptions): () => IterableIterator<ForkEffect> {
  function* handleFetchTranslationsRequest(action: FetchTranslationRequest) {
    try {
      const { locale } = action.payload
      const translations = yield call(() => getTranslation(locale))

      setCurrentLocale(locale)

      yield put(fetchTranslationsSuccess(locale, translations))
    } catch (error) {
      yield put(fetchTranslationsFailure(error.message))
    }
  }
  return function* translationSaga() {
    yield takeEvery(FETCH_TRANSLATIONS_REQUEST, handleFetchTranslationsRequest)
  }
}
