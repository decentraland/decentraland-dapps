![](https://raw.githubusercontent.com/decentraland/web/gh-pages/img/decentraland.ico)

# Decentraland dApps

Common modules for our dApps

# Table of Contents

- [Modules](https://github.com/decentraland/decentraland-dapps#modules)
  - [Wallet](https://github.com/decentraland/decentraland-dapps#wallet)
  - [Storage](https://github.com/decentraland/decentraland-dapps#storage)
  - [Transaction](https://github.com/decentraland/decentraland-dapps#transaction)
  - [Translation](https://github.com/decentraland/decentraland-dapps#translation)
  - [Analytics](https://github.com/decentraland/decentraland-dapps#analytics)
  - [Loading](https://github.com/decentraland/decentraland-dapps#loading)
  - [Location](https://github.com/decentraland/decentraland-dapps#location)
- [Lib](https://github.com/decentraland/decentraland-dapps#lib)
  - [API](https://github.com/decentraland/decentraland-dapps#api)
- [Containers](https://github.com/decentraland/decentraland-dapps#lib)
  - [App](https://github.com/decentraland/decentraland-dapps#app)
  - [Navbar](https://github.com/decentraland/decentraland-dapps#navbar)
  - [Footer](https://github.com/decentraland/decentraland-dapps#footer)
  - [SignInPage](https://github.com/decentraland/decentraland-dapps#signinpage)
  - [EtherscanLink](https://github.com/decentraland/decentraland-dapps#etherscanlink)

# Modules

Common redux modules for dApps

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
  // your other reducers
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

The storage module allows you to save parts of the redux store in localStorage to make them persistent and migrate it from different versions without loosing it.
This module is required to use other modules like `Transaction`, `Translation` and `Wallet`.

### Installation

You need to add a middleware and two reducers to your dApp.

**Middleware**:

You will need to create a `storageMiddleware` and add apply it along with your other middlewares:

```ts
// store.ts
import { applyMiddleware, compose, createStore } from 'redux'
import { createStorageMiddleware } from 'decentraland-dapps/dist/modules/storage/middleware'
import { migrations } from './migrations'

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const { storageMiddleware, loadStorageMiddleware } = createStorageMiddleware({
  storageKey: 'storage-key' // this is the key used to save the state in localStorage (required)
  paths: [] // array of paths from state to be persisted (optional)
  actions: [] // array of actions types that will trigger a SAVE (optional)
  migrations: migrations // migration object that will migrate your localstorage (optional)
})

const middleware = applyMiddleware(
  // your other middlewares
  storageMiddleware
)
const enhancer = composeEnhancers(middleware)
const store = createStore(rootReducer, enhancer)

loadStorageMiddleware(store)
```

**Migrations**:

`migrations` looks like

`migrations.ts`:

```ts
export const migrations = {
  2: migrateToVersion2(data),
  3: migrateToVersion3(data)
}
```

Where every `key` represent a migration and every `method` should return the new localstorage data:

```ts
function migrateToVersion2(data) {
  return omit(data, 'translations')
}
```

You don't need to care about updating the version of the migration because it will be set automatically.

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
    // your other reducers
  })
)
```

### Advanced Usage

This module is necessary to use other modules like `Transaction`, `Translation` and `Wallet`, but you can also use it to make other parts of your dApp's state persistent

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

This module requires you to install the [Storage](https://github.com/decentraland/decentraland-dapps#storage) module in order to work.

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

Or `buildTransactionWithReceiptPayload` if you need the tx event logs

```ts
export const sendInvitesSuccess = (txHash: string, address: string) =>
  action(SEND_INVITE_SUCCESS, {
    ...buildTransactionWithReceiptPayload(txHash, {
      address
    }),
    address
  })
```

It will save the event logs inside `{ receipt: { logs: [] } }` after the tx was confirmed

Then you can use the selectors `getPendingTransactions` and `getTransactionHistory` from `decentraland-dapps/dist/modules/transaction/selectors` to get the list of pending transactions and the transaction history.

### Installation

You need to add a middleware, a reducer and a saga to use this module.

**Middleware**:

Create the `transactionMiddleware` and apply it

```ts
// store.ts
import { createTransactionMiddleware } from 'decentraland-dapps/dist/modules/transaction/middleware'
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

export const INITIAL_STATE: InviteState = {
  loading: [],
  data: {},
  error: null
}

export function invitesReducer(
  state: InviteState = INITIAL_STATE,
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

This module allows you to do i18n.

### Dependencies

This module requires you to install the [Storage](https://github.com/decentraland/decentraland-dapps#storage) module

### Usage

Using the helper `t()` you can add translations to your dApp

```tsx
import * as React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

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

Yon can dispatch the `changeLocale(locale: string)` action from `decentraland-dapps/dist/modules/translation/actions` to change the language

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

## Analytics

The analytics module let's integrate Segment into your dApp.

You need to have the `Wallet` module installed in order to send `identify` events.

You need to use `react-router-redux` in order to send `page` events.

To send `track` events, add an `analytics.ts` file and require it from your entry point, and use the `add()` helper to add actions that you want to track:

```ts
// analytics.ts
import { add } from 'decentraland-dapps/dist/modules/analytics/utils'
import {
  CREATE_VOTE_SUCCESS,
  CreateVoteSuccessAction
} from 'modules/vote/actions'

add(CREATE_VOTE_SUCCESS, 'Vote', (action: CreateVoteSuccessAction) => ({
  poll_id: action.payload.vote.poll_id,
  option_id: action.payload.vote.option_id,
  address: action.payload.wallet.address
}))
```

The first parameter is the action type that you want to track (required).

The second parameter is the event name for that action (it will show up with that name in Segment). If none provided the action type will be used as the event name.

The third parameter is a function that takes the action and returns the data that you want to associate with that event (it will be sent to Segment). If none is provided the whole action will be sent.

### Installation

You need to apply a middleware and a saga to use this module

**Middleware**:

```ts
// store.ts
import { createAnalyticsMiddleware } from '@dapps/modules/analytics/middleware'

const analyticsMiddleware = createAnalyticsMiddleware('SEGMENT WRITE KEY')

const middleware = applyMiddleware(
  // your other middlewares
  analyticsMiddleware
)
const enhancer = composeEnhancers(middleware)
const store = createStore(rootReducer, enhancer)
```

**Saga**:

```ts
import { all } from 'redux-saga/effects'
import { analyticsSaga } from 'decentraland-dapps/dist/modules/analytics/sagas'

export function* rootSaga() {
  yield all([
    analyticsSaga()
    // your other sagas
  ])
}
```

### Advanced Usage

You can use the same redux action type to generate different Segment events if you pass a function as the second parameter instead of a string:

```ts
add(
  AUTHORIZE_LAND_SUCCESS,
  action => (action.isAuthorized ? 'Authorize LAND' : 'Unauthorize LAND')
)
```

## Loading

The loading module is used to keep track of async actions in the state.

### Usage

You can use the selectors `isLoading(state)` and `isLoadingType(state, ACTION_TYPE)` from `decentraland-dapps/dist/modules/loading/selectors` to know if a domain has pending actions or if a specific action is still pending

In order to use these selectors you need to use the `loadingReducer` within your domain reducers, here is an example:

```ts
import {
  loadingReducer,
  LoadingState
} from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  FETCH_INVITES_REQUEST,
  FETCH_INVITES_SUCCESS,
  FETCH_INVITES_FAILURE,
  FetchInvitesSuccessAction,
  FetchInvitesFailureAction,
  FetchInvitesRequestAction
} from './actions'

export type InviteState = {
  loading: LoadingState
  data: {
    [address: string]: number
  }
  error: null | string
}

export const INITIAL_STATE: InviteState = {
  loading: [],
  data: {},
  error: null
}

export type InviteReducerAction =
  | FetchInvitesRequestAction
  | FetchInvitesSuccessAction
  | FetchInvitesFailureAction

export function invitesReducer(
  state: InviteState = INITIAL_STATE,
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
    default: {
      return state
    }
  }
}
```

Now we can for example use the selector `isLoadingType(state.invite.loading, FETCH_INVITES_REQUEST)` to know if that particular action is still pending, or `isLoading(states.invite)` to know if there's any pending action for that domain.

Also, all the pending actions are stored in an array in `state.invite.loading` so we can use that information in the UI if needed (i.e. disable a button)

## Location

The location module provides the `navigateTo`, `navigateToSignIn` and `navigateToRoot` actions that wrap `react-router-redux`'s `push` action. It also provides some helpful selectors:

```ts
getLocation(state)
getPathname(state)
getPathAction(state) // returns the final part of a url (after the last slash)
isSignIn(state)
isRoot(state)
```

### Installation

You need to add a reducer and a saga to use this module

**Reducer**:

Add the `locationReducer` as `location` to your `rootReducer`:

```ts
import { combineReducers } from 'redux'
import { locationReducer as location } from 'decentraland-dapps/dist/modules/location/reducer'

export const rootReducer = combineReducers({
  location
  // your other reducers
})
```

**Saga**:

```ts
import { all } from 'redux-saga/effects'
import { locationSaga } from 'decentraland-dapps/modules/location/sagas'

export function* rootSaga() {
  yield all([
    locationSaga()
    // your other sagas
  ])
}
```

### Advanced Usage

You can use different paths for default locations by creating a location reducer

<details><summary>Learn More</summary>
<p>

```ts
import { combineReducers } from 'redux'
import { createLocationReducer } from 'decentraland-dapps/dist/modules/location/reducer'

const location = createLocationReducer({
  root: '/',
  signIn: '/sign-in'
})

export const rootReducer = combineReducers({
  location
  // your other reducers
})
```

This way you can change the default locations to use different ones. This will be used by the selectors like `isSignIn` and `isRoot`. which impacts the behaviour of several containers like `Navbar` and `SignInPage`

</p>
</details>

# Lib

Common libraries for dApps

## API

The `BaseAPI` class can be extended to make requests and it handles the unwrapping of responses by `decentraland-server`

### Usage

```ts
// lib/api
import { BaseAPI } from 'decentraland-dapps/dist/lib/api'

const URL = 'http://localhost/api'

export class API extends BaseAPI {
  fetchSomething() {
    return this.request('get', '/something', {})
  }
}

export const api = new API(URL)
```

# Containers

Common containers for dApps

## Navbar

The `<Navbar>` container can be used in the same way as the `<Navbar>` component from [decentraland-ui](https://github.com/decentraland/ui) but it's already connected to the redux store. You can override any `NavbarProp` if you want to connect differently, and you can pass all the regular `NavbarProps` to it.

### Dependencies

This container requires you to install the [Wallet](https://github.com/decentraland/decentraland-dapps#wallet) and the [Location](https://github.com/decentraland/decentraland-dapps#location) modules. It also has support for i18n out of the box if you include the [Translation](https://github.com/decentraland/decentraland-dapps#translation) module.

### Usage

This is an example of a `SomePage` component that uses the `<Navbar>` container:

```tsx
import * as React from 'react'

import { Container } from 'decentraland-ui'
import Navbar from 'decentraland-dapps/dist/containers/Navbar'

import './SomePage.css'

export default class SomePage extends React.PureComponent {
  static defaultProps = {
    children: null
  }

  render() {
    const { children } = this.props

    return (
      <>
        <Navbar />
        <div className="SomePage">
          <Container>{children}</Container>
        </div>
      </>
    )
  }
}
```

This `<Navbar>` will show the user's blockie and mana balance because it is connected to the store.

### i18n

If you are using the [Translation](https://github.com/decentraland/decentraland-dapps#translation) module, the `Navbar` contatiner comes with support for the 6 languages supported by the library.

### Advanced Usage

You can override any of the default translations for any locale if you need to

<details><summary>Learn More</summary>
<p>

Say you want to override some translations in English, just include any or all of the following translations in your `en.json` locale file:

```json
{
  "@dapps": {
    "navbar": {
      "account": {
        "connecting": "Connecting...",
        "signIn": "Sign In"
      },
      "menu": {
        "agora": "Agora",
        "blog": "Blog",
        "docs": "Docs",
        "marketplace": "Marketplace"
      }
    }
  }
}
```

## Footer

The `<Footer>` container can be used in the same way as the `<Footer>` component from [decentraland-ui](https://github.com/decentraland/ui) but it's already connected to the redux store. You can override any `FooterProps` if you want to connect differently, and you can pass all the regular `FooterProps` to it.

### Dependencies

The `<Footer>` container has support for i18n out of the box if you include the [Translation](https://github.com/decentraland/decentraland-dapps#translation) module.

### Usage

This is an example of a `SomePage` component that uses the `<Footer>` container:

```tsx
import * as React from 'react'

import { Container } from 'decentraland-ui'
import Navbar from 'decentraland-dapps/dist/containers/Navbar'

import './SomePage.css'

export default class SomePage extends React.PureComponent {
  render() {
    const { children } = this.props
    return (
      <>
        <div className="SomePage">
          <Container>{children}</Container>
        </div>
        <Footer locales={['en', 'es']} />
      </>
    )
  }
}
```

This `<Footer>` will show only English and Spanish as the options in the language dropdown. If you don't provide any it will use the 6 supported languages: `en`, `es`, `fr`, `jp`, `ko` and `zh`.

### i18n

If you are using the [Translation](https://github.com/decentraland/decentraland-dapps#translation) module, the `Footer` contatiner comes with support for the 6 languages supported by the library.

### Advanced Usage

You can override any of the default translations for any locale if you need to

<details><summary>Learn More</summary>
<p>

Say you want to override some translations in English, just include any or all of the following translations in your `en.json` locale file:

```json
{
  "@dapps": {
    "footer": {
      "dropdown": {
        "en": "English",
        "es": "Spanish",
        "fr": "French",
        "ja": "Japanese",
        "ko": "Korean",
        "zh": "Chinese"
      },
      "links": {
        "content": "Content Policy",
        "ethics": "Code of Ethics",
        "home": "Home",
        "privacy": "Privacy Policy",
        "terms": "Terms of Use"
      }
    }
  }
}
```

## SignInPage

The `<SignInPage>` container can be used in the same way as the `<SignIn>` component from [decentraland-ui](https://github.com/decentraland/ui) but it's already connected to the redux store. You can override any `SignInProp` if you want to connect differently, and you can pass all the regular `SignInProps` to it.

### Dependencies

This container requires you to install the [Wallet](https://github.com/decentraland/decentraland-dapps#wallet) and the [Location](https://github.com/decentraland/decentraland-dapps#location) modules. It also has support for i18n out of the box if you include the [Translation](https://github.com/decentraland/decentraland-dapps#translation) module.

### Usage

You can import the `<SignInPage>` container and use it on your routes:

```tsx
import * as React from 'react'
import { Switch, Route } from 'react-router-dom'

import SignInPage from 'decentraland-dapps/dist/containers/SignInPage'

//...

<Switch>
  <Route exact path='/' component={...} />
  {/* your dapps routes... */}
  <Route exact path='/sign-in' component={SignInPage} />
</Switch>
```

### i18n

If you are using the [Translation](https://github.com/decentraland/decentraland-dapps#translation) module, the `SignInPage` contatiner comes with support for the 6 languages supported by the library.

### Advanced Usage

You can override any of the default translations for any locale if you need to

<details><summary>Learn More</summary>
<p>

Say you want to override some translations in English, just include any or all of the following translations in your `en.json` locale file:

```json
{
  "@dapps": {
    "sign_in": {
      "connect": "Connect",
      "connected": "Connected",
      "connecting": "Connecting...",
      "error": "Could not connect to wallet.",
      "get_started": "Get Started",
      "options": {
        "desktop": "You can use the {metamask_link} extension or a hardware wallet like {ledger_nano_link}.",
        "mobile": "You can use mobile browsers such as {coinbase_link} or {imtoken_link}."
      }
    }
  }
}
```

## App

The `<App>` container is the easiest way to bootstrap your dApp. Internally it will use a `<Navbar>`, `<Page>` and `<Footer>` components, and connect them all to the redux store. It takes all the props from `NavbarProps`, `PageProps` and `FooterProps` and if you provide any of them it will override the connected props.

It also has a `hero` and a `heroHeight` props that can be used to easily include a hero for the homepage (optional).

### Dependencies

This container requires you to install the [Wallet](https://github.com/decentraland/decentraland-dapps#wallet) and the [Location](https://github.com/decentraland/decentraland-dapps#location) modules. It also has support for i18n out of the box if you include the [Translation](https://github.com/decentraland/decentraland-dapps#translation) module.

### Usage

You just need to use the `<App>` component to wrapp your dApp:

```tsx
import App from 'decentraland-dapps/dist/containers/App'

export default class MyApp extends React.Component {
  render() {
    return <App>{/* your dApp here */}</App>
  }
}
```

You can pass any `NavbarProps`, `FooterProps` or `PageProps` and they will be passed down to the corresponding component:

```tsx
import App from 'decentraland-dapps/dist/containers/App'

export default class MyApp extends React.Component {
  render() {
    return (
      <App activePage="marketplace" locales={['en', 'es']}>
        {/* your dApp here */}
      </App>
    )
  }
}
```

You can also pass a `hero` and it will be used in the homepage, and adjust the height of the hero with the prop `heroHeight` (default height is `302` pixels)

```tsx
import App from 'decentraland-dapps/dist/containers/App'

import Hero from '../components/Hero'

export default class MyApp extends React.Component {
  render() {
    return (
      <App
        hero={<Hero />}
        heroHeight={302}
        activePage="marketplace"
        locales={['en', 'es']}
      >
        {/* your dApp here */}
      </App>
    )
  }
}
```

## EtherscanLink

The `<EtherscanLink>` can be used to link a transaction hash to Etherscan.io, and it connects to the redux store to know on which network the user is on.

### Dependencies

This container requires you to install the [Wallet](https://github.com/decentraland/decentraland-dapps#wallet) module

### Usage

```tsx
import * as React from 'react'
import EtherscanLink from 'decentraland-dapps/dist/containers/EtherscanLink'

export default class MyComponent extends React.PureComponent {
  render() {
    return (
      <p>
        You sent an <EtherscanLink txHash={'0x...'}>invite</EtherscanLink>
      </p>
    )
  }
}
```
