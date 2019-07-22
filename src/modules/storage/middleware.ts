import { Store } from 'redux'
import * as storage from 'redux-persistence'
import createStorageEngine from 'redux-storage-engine-localstorage'
import filter from 'redux-storage-decorator-filter'
import { hasLocalStorage, migrateStorage } from '../../lib/localStorage'
import { disabledMiddleware } from '../../lib/disabledMiddleware'
import { STORAGE_LOAD } from './actions'
import { StorageMiddleware } from './types'
import {
  CHANGE_LOCALE,
  FETCH_TRANSLATIONS_SUCCESS
} from '../translation/actions'
import {
  FETCH_TRANSACTION_REQUEST,
  FETCH_TRANSACTION_SUCCESS,
  FETCH_TRANSACTION_FAILURE,
  UPDATE_TRANSACTION_STATUS,
  UPDATE_TRANSACTION_NONCE,
  REPLACE_TRANSACTION_SUCCESS,
  FIX_REVERTED_TRANSACTION,
  CLEAR_TRANSACTIONS,
  CLEAR_TRANSACTION
} from '../transaction/actions'

const disabledLoad = (store: any) =>
  setTimeout(() => store.dispatch({ type: STORAGE_LOAD, payload: {} }))

export function createStorageMiddleware<T>(options: StorageMiddleware<T>) {
  const { storageKey, migrations = {}, paths = [], actions = [] } = options

  if (!hasLocalStorage()) {
    return {
      storageMiddleware: disabledMiddleware as any,
      loadStorageMiddleware: disabledLoad as any
    }
  }

  const localStorageState = migrateStorage(storageKey, migrations)
  let setItemFailure = false

  if (localStorageState) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(localStorageState))
    } catch (e) {
      setItemFailure = true
      console.warn(e.message)
    }
  }

  const storageEngine = filter(createStorageEngine(storageKey), [
    'transaction',
    ['wallet', 'data', 'locale'],
    ['wallet', 'data', 'derivationPath'],
    ['storage', 'version'],
    ...paths
  ])

  const whitelist = [
    CHANGE_LOCALE,
    FETCH_TRANSLATIONS_SUCCESS,
    FETCH_TRANSACTION_REQUEST,
    FETCH_TRANSACTION_SUCCESS,
    FETCH_TRANSACTION_FAILURE,
    UPDATE_TRANSACTION_STATUS,
    UPDATE_TRANSACTION_NONCE,
    REPLACE_TRANSACTION_SUCCESS,
    FIX_REVERTED_TRANSACTION,
    CLEAR_TRANSACTIONS,
    CLEAR_TRANSACTION,
    ...actions
  ]

  const storageMiddleware: any = storage.createMiddleware(storageEngine, {
    filterAction: (action: any) => {
      return whitelist.includes(action.type)
    },
    transform: options.transform,
    onError: options.onError
  })

  const load = (store: Store<any>) => {
    if (setItemFailure) {
      const unsubscribe = store.subscribe(() => {
        const state = store.getState()
        if (state.storage.loading === false) {
          unsubscribe()
          store.dispatch({ type: storage.LOAD, payload: localStorageState })
        }
      })
    }

    storage.createLoader(storageEngine)(store)
  }

  return { storageMiddleware, loadStorageMiddleware: load }
}
