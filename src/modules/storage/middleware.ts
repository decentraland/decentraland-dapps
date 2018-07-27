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
import {
  FETCH_TRANSACTION_REQUEST,
  FETCH_TRANSACTION_SUCCESS,
  FETCH_TRANSACTION_FAILURE
} from '../transaction/types'

const disabledLoad = (store: Store<any>) =>
  setTimeout(() => store.dispatch({ type: STORAGE_LOAD, payload: {} }))

export function createStorageMiddleware(
  storageKey: string,
  paths: string[] | string[][] = [],
  actions: string[] = []
) {
  if (!hasLocalStorage()) {
    return {
      storageMiddleware: disabledMiddleware,
      loadStorageMiddleware: disabledLoad
    }
  }

  const storageEngine = filter(createStorageEngine(storageKey), [
    'transaction',
    'translation',
    ['wallet', 'data', 'locale'],
    ['wallet', 'data', 'derivationPath'],
    ...paths
  ])
  const storageMiddleware: Middleware = storage.createMiddleware(
    storageEngine,
    [],
    [
      CHANGE_LOCALE,
      FETCH_TRANSLATIONS_REQUEST,
      FETCH_TRANSLATIONS_SUCCESS,
      FETCH_TRANSLATIONS_FAILURE,
      FETCH_TRANSACTION_REQUEST,
      FETCH_TRANSACTION_SUCCESS,
      FETCH_TRANSACTION_FAILURE,
      ...actions
    ]
  )
  const load = (store: Store<any>) => storage.createLoader(storageEngine)(store)

  return { storageMiddleware, loadStorageMiddleware: load }
}
