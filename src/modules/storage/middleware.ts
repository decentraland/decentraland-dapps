import { Store, Middleware } from 'redux'
import * as storage from 'redux-storage'
import createStorageEngine from 'redux-storage-engine-localstorage'
import filter from 'redux-storage-decorator-filter'
import {
  CHANGE_LOCALE,
  FETCH_TRANSLATIONS_REQUEST,
  FETCH_TRANSLATIONS_SUCCESS,
  FETCH_TRANSLATIONS_FAILURE
} from '../translation/types'
import { STORAGE_LOAD } from './types'
import { hasLocalStorage } from '../../lib/localStorage'
import { disabledMiddleware } from '../../lib/disabledMiddleware'

const disabledLoad = (store: Store<any>) =>
  setTimeout(() => store.dispatch({ type: STORAGE_LOAD, payload: {} }))

export function createStorageMiddleware(storageKey: string) {
  if (!hasLocalStorage()) {
    return {
      storageMiddleware: disabledMiddleware,
      loadStorageMiddleware: disabledLoad
    }
  }

  const storageEngine = filter(createStorageEngine(storageKey), [
    'translation',
    ['wallet', 'data', 'locale']
  ])
  const storageMiddleware: Middleware = storage.createMiddleware(
    storageEngine,
    [],
    [
      CHANGE_LOCALE,
      FETCH_TRANSLATIONS_REQUEST,
      FETCH_TRANSLATIONS_SUCCESS,
      FETCH_TRANSLATIONS_FAILURE
    ]
  )
  const load = (store: Store<any>) => storage.createLoader(storageEngine)(store)

  return { storageMiddleware, loadStorageMiddleware: load }
}
