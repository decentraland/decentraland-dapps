import * as storage from 'redux-storage'
import createStorageEngine from 'redux-storage-engine-localstorage'
import filter from 'redux-storage-decorator-filter'
import { hasLocalStorage } from '../../lib/localStorage'
import { disabledMiddleware } from '../../lib/disabledMiddleware'
import { STORAGE_LOAD } from './actions'
import {
  CHANGE_LOCALE,
  FETCH_TRANSLATIONS_REQUEST,
  FETCH_TRANSLATIONS_SUCCESS,
  FETCH_TRANSLATIONS_FAILURE
} from '../translation/actions'
import {
  FETCH_TRANSACTION_REQUEST,
  FETCH_TRANSACTION_SUCCESS,
  FETCH_TRANSACTION_FAILURE,
  UPDATE_TRANSACTION_STATUS,
  UPDATE_TRANSACTION_NONCE,
  REPLACE_TRANSACTION_SUCCESS
} from '../transaction/actions'

const disabledLoad = (store: any) =>
  setTimeout(() => store.dispatch({ type: STORAGE_LOAD, payload: {} }))

export function createStorageMiddleware(
  storageKey: string,
  paths: string[] | string[][] = [],
  actions: string[] = []
) {
  if (!hasLocalStorage()) {
    return {
      storageMiddleware: disabledMiddleware as any,
      loadStorageMiddleware: disabledLoad as any
    }
  }

  const storageEngine = filter(createStorageEngine(storageKey), [
    'transaction',
    'translation',
    ['wallet', 'data', 'locale'],
    ['wallet', 'data', 'derivationPath'],
    ...paths
  ])
  const storageMiddleware: any = storage.createMiddleware(
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
      UPDATE_TRANSACTION_STATUS,
      UPDATE_TRANSACTION_NONCE,
      REPLACE_TRANSACTION_SUCCESS,
      ...actions
    ]
  )
  const load = (store: any) => storage.createLoader(storageEngine)(store)

  return { storageMiddleware, loadStorageMiddleware: load }
}
