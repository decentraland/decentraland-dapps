![](https://raw.githubusercontent.com/decentraland/web/gh-pages/img/decentraland.ico)

# Decentraland dApps

Common modules for our dApps

# Table of Contents

- [Modules](https://github.com/decentraland/decentraland-dapps#modules)
  - [Wallet](https://github.com/decentraland/decentraland-dapps#wallet)
  - [Storage](https://github.com/decentraland/decentraland-dapps#storage)
  - [Transaction](https://github.com/decentraland/decentraland-dapps#transaction)
  - [Translation](https://github.com/decentraland/decentraland-dapps#translation)

# Modules

## Wallet

This module takes care of connecting to MetaMask/Ledger, and insert in the state some useful information like address, network, mana and derivationPath.

### Usage

You can use the following selectors importing them from `decentraland-dapps/dist/modules/wallet/selectors`:

```tsx
getData = (state: State) => BaseWallet
getError = (state: State) => string
getNetwork = (state: State) =>
  'mainnet' | 'ropsten' | 'rinkeby' | 'kovan' | 'localhost'
getAddress = (state: State) => string
isConnected = (state: State) => boolean
isConnecting = (state: State) => boolean
```

Also you can hook to the following actions from your reducers/sagas by importing them from `decentraland-dapps/dist/modules/wallet/actions`:

```tsx
CONNECT_WALLET_REQUEST
CONNECT_WALLET_SUCCESS
CONNECT_WALLET_FAILURE
```

Also you can import types for those actions from that same file:

```tsx
ConnectWalletRequestAction
ConnectWalletSuccessAction
ConnectWalletFailureAction
```

This is an example of how you can wait for the `CONNECT_WALLET_SUCCESS` action to trigger other actions:

```tsx
// modules/something/sagas.ts
import {
  CONNECT_WALLET_SUCCESS,
  ConnectWalletSuccessAction
} from 'decentraland-dapps/dist/modules/wallet/actions'
import { fetchSomethingRequest } from './actions'

export function* saga() {
  yield takeLatest(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
}

function* handleConnectWalletSuccess(action: ConnectWalletSuccessAction) {
  yield put(fetchSomethingRequest())
}
```

### Installation

In order to install this module you will need to add a provider, a reducer and a saga to your dapps.

**Provider**:

Add the `<WalletProvider>` as a child of your `redux` provider. If you use `react-router-redux` make sure the `<ConnectedRouter>` is a child of the `<WalletProvider>` and not the other way around, like this:

```tsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import WalletProvider from 'decentraland-dapps/dist/providers/WalletProvider'
import { store, history } from './store'

ReactDOM.render(
  <Provider store={store}>
    <WalletProvider>
      <ConnectedRouter history={history}>{/* Your App */}</ConnectedRouter>
    </WalletProvider>
  </Provider>,
  document.getElementById('root')
)
```

**Reducer**:

Import the `walletReducer` and add it at the root level of your dApp's reducer as `wallet`, like this:

```ts
import { combineReducers } from 'redux'
import { walletReducer as wallet } from 'decentraland-dapps/dist/modules/wallet/reducer'

export const rootReducer = combineReducers({
  wallet
  // your other reducers here
})
```

**Saga**:

You will need to create a `walletSaga` and add it to your `rootSaga`:

```ts
import { all } from 'redux-saga/effects'
import { eth, contracts } from 'decentraland-eth'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'

const MANAToken = new contracts.MANAToken('0xdeadbeeffaceb00c') // contract address here

const walletSaga = createWalletSaga({
  provider: 'https://mainnet.infura.io', // this param is required to have Ledger support
  contracts: [MANAToken], // add all the contracts you will use here, but MANAToken is required!
  eth // you have to pass the `eth` instance because it's a singleton
})

export function* rootSaga() {
  yield all([
    walletSaga()
    // your other sagas here
  ])
}
```

### Advanced Usage

You can extend the wallet module if you need to.

<details><summary>Learn More</summary>
<p>

Say you want to add the amount of `land` as a property of the wallet, you can create a `wallet` module in your dApp and add the following files:

**Types**:

```ts
// modules/wallet/types.ts
import { BaseWallet } from 'decentraland-dapps/dist/modules/wallet/types'

export interface Wallet extends BaseWallet {
  land: number | null
}
```

**Actions**:

```ts
// modules/wallet/actions.ts
import { action } from 'typesafe-actions'

export const FETCH_LAND_AMOUNT_REQUEST = '[Request] Fetch LAND Amount'
export const FETCH_LAND_AMOUNT_SUCCESS = '[Success] Fetch LAND Amount'
export const FETCH_LAND_AMOUNT_FAILURE = '[Failure] Fetch LAND Amount'

export const fetchLandAmountRequest = (address: string) =>
  action(FETCH_LAND_AMOUNT_REQUEST, { address })
export const fetchLandAmountSuccess = (address: string, land: number) =>
  action(FETCH_LAND_AMOUNT_SUCCESS, { address, land })
export const fetchLandAmountFailure = (error: string) =>
  action(FETCH_LAND_AMOUNT_FAILURE, { error })

export type FetchLandAmountRequestAction = ReturnType<
  typeof fetchLandAmountRequest
>
export type FetchLandAmountSuccessAction = ReturnType<
  typeof fetchLandAmountSuccess
>
export type FetchLandAmountFailureAction = ReturnType<
  typeof fetchLandAmountFailure
>
```

**Reducer**:

```ts
// modules/wallet/reducer.ts
import { AnyAction } from 'redux'
import {
  walletReducer as baseWallerReducer,
  INITIAL_STATE as BASE_INITIAL_STATE,
  WalletState as BaseWalletState,
  WalletReducerAction as BaseWalletReducerAction
} from 'decentraland-dapps/dist/modules/wallet/reducer'
import { FETCH_WALLET_LAND_AMOUNT_SUCCESS } from './actions'
import { Wallet } from './types'

export interface WalletState extends BaseWalletState {
  data: Partial<Wallet>
}

const INITIAL_STATE: WalletState = {
  ...BASE_INITIAL_STATE,
  data: {
    ...BASE_INITIAL_STATE.data,
    land: null
  }
}

export function walletReducer(state = INITIAL_STATE, action: AnyAction) {
  switch (action.type) {
    case FETCH_WALLET_LAND_AMOUNT_SUCCESS: {
      const { land } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          land
        }
      }
    }
    default:
      return baseWallerReducer(state, action as BaseWalletReducerAction)
  }
}
```

**Saga**:

```ts
import { call, select, takeEvery, put, all } from 'redux-saga/effects'
import { eth, contracts } from 'decentraland-eth'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'
import {
  ConnectWalletSuccessAction,
  CONNECT_WALLET_SUCCESS
} from 'decentraland-dapps/dist/modules/wallet/actions'
import {
  FETCH_LAND_AMOUNT_REQUEST,
  FetchLandAmountRequestAction,
  fetchLandAmountSuccess,
  fetchLandAmountFailure
} from './actions'

const MANAToken = new contracts.MANAToken('0x...')
const LANDRegistry = new contracts.LANDRegistry('0x...')

const baseWalletSaga = createWalletSaga({
  provider: 'https://{network}.infura.io',
  contracts: [MANAToken, LANDRegistry],
  eth
})

export function* walletSaga() {
  yield all([baseWalletSaga(), landAmountSaga()])
}

function* landAmountSaga() {
  yield takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
  yield takeEvery(FETCH_LAND_AMOUNT_REQUEST, handleFetchLandAmountRequest)
}

function* handleConnectWalletSuccess(action: ConnectWalletSuccessAction) {
  const { wallet } = action.payload
  yield put(fetchLandAmountRequest(wallet.address))
}

function* handleFetchLandAmountRequest(action: FetchLandAmountRequestAction) {
  try {
    const { address } = action.payload
    const land = yield call(() => LANDRegistry.balanceOf(address))
    yield put(fetchLandAmountSuccess(address, land))
  } catch (error) {
    yield put(fetchLandAmountFailure(error.message))
  }
}
```

</p>
</details>

## Storage

The storage module allows you to save parts of the redux store in localStorage to make them persistent.
This module is required to use other modules like `Transaction` and `Translation`.

### Installation

You need to add a middleware and a two reducers to your dApp.

**Middleware**:

You will need to create a `storageMiddleware` and add apply it along with your other middlewares:

```ts
// store.ts
import { applyMiddleware, compose, createStore } from 'redux'
import { createStorageMiddleware } from 'decentraland-dapps/dist/modules/storage/middleware'

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const { storageMiddleware, loadStorageMiddleware } = createStorageMiddleware(
  'storage-key', // this is the key used to save the state in localStorage (required)
  [], // array of paths from state to be persisted (optional)
  [] // array of actions types that will trigger a SAVE (optional)
)

const middleware = applyMiddleware(
  // your other middlewares
  storageMiddleware
)
const enhancer = composeEnhancers(middleware)
const store = createStore(rootReducer, enhancer)

loadStorageMiddleware(store)
```

**Reducer**:

You will need to add `storageReducer` as `storage` to your `rootReducer` and then wrap the whole reducer with `storageReducerWrapper`

```ts
import { combineReducers } from 'redux'

import {
  storageReducer as storage,
  storageReducerWrapper
} from 'decentraland-dapps/dist/modules/storage/reducer'

export const rootReducer = storageReducerWrapper(
  combineReducers({
    storage
  })
)
```

### Advanced Usage

This module is necessary to use other modules like `Transaction` or `Translation`, but you can also use it to make other parts of your dApp's state persistent

<details><summary>Learn More</summary>
<p>

The first parameter of `createStorageMiddleware` is the key used to store the state data in localStorage (required).

The second parameter is an array of paths from the state that you want to be stored, ie:

```ts
const paths = [['invites'][('user', 'name')]]
```

That will make `state.invites` and `state.user.name` persistent. This parameter is optional and you don't have to configure it to use the `Transaction` and/or `Translation` modules.

The third parameter is an array of action types that will trigger a SAVE of the state in localStorage, ie:

```ts
const actionTypes = [SEND_INVITE_SUCCESS]
```

This parameter is optional and is and you don't have to configure it to use the `Transaction` and/or `Translation` modules.

</p>
</details>

## Transaction

The transaction module allows you to watch for pending transactions and keep track of the transaction history.

### Dependencies

This module requires you to install the `Storage` module in order to work.

### Usage

When you have an action that creates a transaction and you want to watch it, you can do with `buildTransactionPayload`:

```ts
import { action } from 'typesafe-actions'
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'

// Send Invite

export const SEND_INVITE_REQUEST = '[Request] Send Invite'
export const SEND_INVITE_SUCCESS = '[Success] Send Invite'
export const SEND_INVITE_FAILURE = '[Failure] Send Invite'

export const sendInvitesRequest = (address: string) =>
  action(SEND_INVITE_REQUEST, {
    address
  })

export const sendInvitesSuccess = (txHash: string, address: string) =>
  action(SEND_INVITE_SUCCESS, {
    ...buildTransactionPayload(txHash, {
      address
    }),
    address
  })

export const sendInvitesFailure = (address: string, errorMessage: string) =>
  action(SEND_INVITE_FAILURE, {
    address,
    errorMessage
  })

export type SendInvitesRequestAction = ReturnType<typeof sendInvitesRequest>
export type SendInvitesSuccessAction = ReturnType<typeof sendInvitesSuccess>
export type SendInvitesFailureAction = ReturnType<typeof sendInvitesFailure>
```

Then you can use the selectors `getPendingTransactions` and `getTransactionHistory` from `decentraland-dapps/dist/modules/transaction/selectors` to get the list of pending transactions and the transaction history.

### Installation

You need to add a middleware, a reducer and a saga to use this module.

**Middleare**:

Create the `transactionMiddleware` and apply it

```ts
// store.ts
import { createTransactionMiddleware } from 'decenraland-dapps/dist/modules/transaction/middleware'
const transactionMiddleware = createTransactionMiddleware()

const middleware = applyMiddleware(
  // your other middlewares
  transactionMiddleware
)
```

**Reducer**:

Add `transactionReducer` as `transaction` to your `rootReducer`

```ts
import { combineReducers } from 'redux'
import { transactionReducer as transaction } from 'decentraland-dapps/dist/modules/transaction/reducer'

export const rootReducer = combineReducers({
  transaction
  // your other reducers
})
```

**Saga**:

Add `transactionSaga` to your `rootSaga`

```ts
import { all } from 'redux-saga/effects'
import { transactionSaga } from 'decentraland-dapps/dist/modules/transaction/sagas'

export function* rootSaga() {
  yield all([
    transactionSaga()
    // your other sagas
  ])
}
```

### Advanced Usage

You can make your reducers listen to confirmed transactions and update your state accordingly

<details><summary>Learn More</summary>
<p>

Taking the example of the `SEND_INVITE_SUCCESS` action type shown in the `Usage` section above, let's say we want to decrement the amount of available invites after the transaction is mined, we can do so by adding the `FETCH_TRANSACTION_SUCCESS` action type in our reducer:

```diff
// modules/invite/reducer
import { AnyAction } from 'redux'
import { loadingReducer } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FETCH_INVITES_REQUEST,
  FETCH_INVITES_SUCCESS,
  FETCH_INVITES_FAILURE,
  FetchInvitesSuccessAction,
  FetchInvitesFailureAction,
  FetchInvitesRequestAction,
+  SEND_INVITE_SUCCESS
} from './actions'
+ import { FETCH_TRANSACTION_SUCCESS, FetchTransactionSuccessAction } from 'decentraland-dapps/dist/modules/transaction/actions';

export type InviteState = {
  loading: AnyAction[]
  data: {
    [address: string]: number
  }
  error: null | string
}

export type InviteReducerAction =
  | FetchInvitesRequestAction
  | FetchInvitesSuccessAction
  | FetchInvitesFailureAction
+  | FetchTransactionSuccessAction

export const InviteInitialState: InviteState = {
  loading: [],
  data: {},
  error: null
}

export function invitesReducer(
  state: InviteState = InviteInitialState,
  action: InviteReducerAction
): InviteState {
  switch (action.type) {
    case FETCH_INVITES_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case FETCH_INVITES_SUCCESS: {
      return {
        loading: loadingReducer(state.loading, action),
        data: {
          ...state.data,
          [action.payload.address]: action.payload.amount
        },
        error: null
      }
    }
    case FETCH_INVITES_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.errorMessage
      }
    }
+    case FETCH_TRANSACTION_SUCCESS: {
+      const { transaction } = action.payload
+      switch (transaction.actionType) {
+        case SEND_INVITE_SUCCESS: {
+          const { address } = (transaction as any).payload
+          return {
+            ...state,
+            data: {
+              ...state.data,
+              [address]: state.data[address] - 1
+            }
+          }
+        }
+        default:
+          return state
+      }
+    }
    default: {
      return state
    }
  }
}
```

</p>
</details>

## Translation

This module allows you to do do i18n.

### Dependencies

This module requires you to install the `Storage` module

### Usage

Using the helper `t()` you can add translations to your dApp

```tsx
import * as React from 'react'
import { t } from 'decentraland-dapps/modules/translation/utils'

export default class BuyButton extends React.PureComponent {
  render() {
    return <button>{t('but_page.buy_button')}</button>
  }
}
```

Then you just have to provide locale files like this:

_en.json_

```json
{
  "buy_page": {
    "buy_button": "Buy"
  }
}
```

_es.json_

```json
{
  "buy_page": {
    "buy_button": "Comprar"
  }
}
```

Yon can use dispatch the `changeLocale(locale: string)` action from `decentraland-dapps/dist/modules/translation/actions` to change the language

### Installation

You will need to add a provider, a reducer and a saga to use this module

**Provider**:

Add the `<TranslationProvider>` as a child of your `redux` provider, passing the `locales` that you want to support. If you use `react-router-redux` make sure the `<ConnectedRouter>` is a child of the `<TranslationProvider>` and not the other way around, like this:

```tsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider'
import { store, history } from './store'

ReactDOM.render(
  <Provider store={store}>
    <TranslationProvider locales={['en', 'es', 'ko', 'zh']}>
      <ConnectedRouter history={history}>{/* Your App */}</ConnectedRouter>
    </TranslationProvider>
  </Provider>,
  document.getElementById('root')
)
```

**Reducer**:

Add the `translationReducer` as `translation` to your `rootReducer`:

```ts
import { combineReducers } from 'redux'
import { translationReducer as translation } from 'decentraland-dapps/dist/modules/translation/reducer'

export const rootReducer = combineReducers({
  translation
  // your other reducers
})
```

**Saga**:

Create a `translationSaga` and add it to your `rootSaga`. You need to provide an object containing all the translations, or a function that takes the `locale` and returns a `Promise` of the translations for that locale (you can use that to fetch the translations from a server instead of bundling them in the app). Here are examples for the two options:

1. Bundling the translations in the dApp:

_en.json_

```json
{
  "buy_page": {
    "buy_button": "Buy"
  }
}
```

_es.json_

```json
{
  "buy_page": {
    "buy_button": "Comprar"
  }
}
```

_translations.ts_

```ts
const en = require('./en.json')
const es = require('./es.json')
export { en, es }
```

_sagas.ts_

```ts
import { all } from 'redux-saga/effects'
import { createTranslationSaga } from 'decentraland-dapps/dist/modules/translation/sagas'
import * as translations from './translations'

export const translationSaga = createTranslationSaga({
  translations
})

export function* rootSaga() {
  yield all([
    translationSaga()
    // your other sagas
  ])
}
```

2. Fetching translations from server

_sagas.ts_

```ts
import { all } from 'redux-saga/effects'
import { createTranslationSaga } from 'decentraland-dapps/dist/modules/translation/sagas'
import { api } from 'lib/api'

export const translationSaga = createTranslationSaga({
  getTranslation: locale => api.fetchTranslations(locale)
})

export function* rootSaga() {
  yield all([
    translationSaga()
    // your other sagas
  ])
}
```
