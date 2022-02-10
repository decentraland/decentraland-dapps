<img src="https://ui.decentraland.org/decentraland_256x256.png" height="128" width="128" />

# Decentraland dApps

Common modules for our dApps

# Table of Contents

- [Modules](https://github.com/decentraland/decentraland-dapps#modules)
  - [Wallet](https://github.com/decentraland/decentraland-dapps#wallet)
  - [Storage](https://github.com/decentraland/decentraland-dapps#storage)
  - [Transaction](https://github.com/decentraland/decentraland-dapps#transaction)
  - [Authorization](https://github.com/decentraland/decentraland-dapps#authorization)
  - [Translation](https://github.com/decentraland/decentraland-dapps#translation)
  - [Analytics](https://github.com/decentraland/decentraland-dapps#analytics)
  - [Loading](https://github.com/decentraland/decentraland-dapps#loading)
  - [Modal](https://github.com/decentraland/decentraland-dapps#modal)
  - [Toasts](https://github.com/decentraland/decentraland-dapps#toasts)
  - [Profile](https://github.com/decentraland/decentraland-dapps#profile)
- [Lib](https://github.com/decentraland/decentraland-dapps#lib)
  - [API](https://github.com/decentraland/decentraland-dapps#api)
  - [ETH](https://github.com/decentraland/decentraland-dapps#eth)
  - [Entities](https://github.com/decentraland/decentraland-dapps#entities)
- [Containers](https://github.com/decentraland/decentraland-dapps#containers)
  - [App](https://github.com/decentraland/decentraland-dapps#app)
  - [Navbar](https://github.com/decentraland/decentraland-dapps#navbar)
  - [Footer](https://github.com/decentraland/decentraland-dapps#footer)
  - [SignInPage](https://github.com/decentraland/decentraland-dapps#signinpage)
  - [Modal](https://github.com/decentraland/decentraland-dapps#modal)
  - [TransactionLink](https://github.com/decentraland/decentraland-dapps#transactionlink)
- [Components](https://github.com/decentraland/decentraland-dapps#components)
  - [Intercom](https://github.com/decentraland/decentraland-dapps#intercom)

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

Add the `<WalletProvider>` as a child of your `redux` provider. If you use `react-router-redux` or `connected-react-router` make sure the `<ConnectedRouter>` is a child of the `<WalletProvider>` and not the other way around, like this:

```tsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
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
import { walletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'

export function* rootSaga() {
  yield all([
    walletSaga()
    // your other sagas here
  ])
}
```

### Advanced Usage

You'll need to supply in which chain you're going to work. It won't affect wallets like Metamask, where you can choose which network to use on the wallet itself, but's necesary for things like email/phone based wallets.
If you're using the [Navbar](#Navbar) container, this chain will determine in which chain the user **must be**. If they're on the incorrect chain (using a network picker with Metamask for example), a modal will pop up blocking the dapp until the state changes.

Remember that the chain id is the number that represents a particular network, 1 being `mainnet`, 3 being `ropsten`, etc.

<details><summary>Learn More</summary>
<p>

Instead of importing `walletSaga`, use `createWalletSaga`:

**Saga**:

```ts
import { all } from 'redux-saga/effects'
import { createWalletSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'

const walletSaga = createWalletSaga({ CHAIN_ID: process.env.chainId })
export function* rootSaga() {
  yield all([
    walletSaga()
    // your other sagas here
  ])
}
```

**Actions**:

If you want to hook a callback to connect the wallet, there're two things to keep in mind. The process of connecting a wallet consists in two steps, first `enabling` it and then properly connecting it. The set of actions to keep in mind are the following (all from `decentraland-dapps/dist/modules/wallet/actions`):

```tsx
enableWalletRequest
enableWalletSuccess
enableWalletFailure
```

With it's corresponding actions and types from the same file:

```tsx
ENABLE_WALLET_REQUEST
ENABLE_WALLET_SUCCESS
ENABLE_WALLET_FAILURE

EnableWalletRequestAction
EnableWalletSuccessAction
EnableWalletFailureAction
```

The wallet saga will listen for `ENABLE_WALLET_SUCCESS` and automatically call `CONNECT_WALLET_REQUEST`. If you use `connect wallet` without enabling first it will only work if you enabled first and it'll stop working once the user disconnects the wallet from the site (if she ever does).

All of this is handled by [SignInPage](#signinpage) behind the scenes, so you can just use that instead. Remember to add [<WalletProvider />](#installation).

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

## Authorization

This module allows you to grant/revoke approvals to a token. It works for both allowance and approval for all.

### Dependencies

This module depends on the [wallet](#wallet) and the [transactions](#transactions) module

### Usage

After [installing](#installing-3) the module, you'll need to initialize the authorizations you want to query using the following action:

```ts
fetchAuthorizationsRequest(authorizations: Authorization[])
```

That action will query the blockchain for each authorization and update the state so you can check it later. You can hook to:

```ts
FETCH_AUTHORIZATIONS_REQUEST
FETCH_AUTHORIZATIONS_SUCCESS
FETCH_AUTHORIZATIONS_FAILURE
```

Once you have this hooked up, you can either grant or revoke a token by using:

```ts
grantTokenRequest(authorization: Authorization)
revokeTokenRequest(authorization: Authorization)
```

You can hook to the following actions:

```ts
GRANT_TOKEN_REQUEST
GRANT_TOKEN_SUCCESS
GRANT_TOKEN_FAILURE

REVOKE_TOKEN_REQUEST
REVOKE_TOKEN_SUCCESS
REVOKE_TOKEN_FAILURE
```

Keep in mind that each of these actions send a transaction, so if you wan't to check if they're done, check the action type of the `FETCH_TRANSACTION_SUCCESS` action. More info on the [transactions](#transactions) module

### Installation

**Reducer**

Add the `authorizationReducer` as `authorization` to your `rootReducer`:

```ts
import { combineReducers } from 'redux'
import { authorizationReducer as authorization } from 'decentraland-dapps/dist/modules/authorization/reducer'

export const rootReducer = combineReducers({
  authorization
  // your other reducers
})
```

**Sagas**

Add the `authorizationSaga` to the `rootSaga`:

```ts
import { all } from 'redux-saga/effects'
import { authorizationSaga } from 'decentraland-dapps/dist/modules/authorization/sagas'

export function* rootSaga() {
  yield all([
    authorizationSaga()
    // your other sagas
  ])
}
```

## Translation

This module allows you to do i18n.

### Dependencies

This module has an optional dependency on [Storage](https://github.com/decentraland/decentraland-dapps#storage) module to cache translations and boot the application faster. To learn more read the `Advanced Usage` section of this module.

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

Add the `<TranslationProvider>` as a child of your `redux` provider, passing the `locales` that you want to support. If you use `react-router-redux` or `connected-react-router` make sure the `<ConnectedRouter>` is a child of the `<TranslationProvider>` and not the other way around, like this:

```tsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
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

Read the `Advanced Usage` section below to learn how to cache translations and make your application boot faster.

### Advanced Usage

You can use the [Storage](https://github.com/decentraland/decentraland-dapps#storage) module to cache translations (read `2. Fetching translations from server` above).

<details><summary>Learn More</summary>
<p>

After [installing the Storage module](https://github.com/decentraland/decentraland-dapps#storage) you can persist the translations by adding `'translation'` to your storage middleware paths:

```ts
// store.ts

const { storageMiddleware, loadStorageMiddleware } = createStorageMiddleware({
  storageKey: 'my-dapp-storage',
  paths: ['translation']
})
```

This will store the translation module in `localStorage`, so next time your application is started it will boot with all the translations populated before even fetching them from the server.

</p>
</details>

## Analytics

The analytics module let's integrate Segment into your dApp.

You need to have the `Wallet` module installed in order to send `identify` events.

This module will import the segment snippet into your dApp. Be aware that the middleware must be loaded before using segment methods.

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

This uses by default the `'@@router/LOCATION_CHANGE'` action type to track page changes. If you need to use a different action type, you can do the following:

```ts
import { all } from 'redux-saga/effects'
import { createAnalyticsSaga } from 'decentraland-dapps/dist/modules/analytics/sagas'

const analyticsSaga = createAnalyticsSaga({
  LOCATION_CHANGE: 'custom action type'
})

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
add(AUTHORIZE_LAND_SUCCESS, action =>
  action.isAuthorized ? 'Authorize LAND' : 'Unauthorize LAND'
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

## Modal

Leverages redux state and provides actions to open and close each modal by name. It provides a few simple actions:

```ts
openModal(name: string, metadata: any = null)
closeModal(name: string)
closeAllModals()
toggleModal(name: sgtring)
```

It also provides a selector to get the open modals:

```
getOpenModals(state): ModalState
```

### Installation

In order to use this module you need to add a reducer and a provider.

**Provider**:

Add the `<ModalProvider>` as a parent of your routes. It takes an object of `{ {modalName: string]: React.Component }` as a prop (`components`). It'll use it to render the appropiate modal when you call `openModal(name: string)`

```tsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import ModalProvider from 'decentraland-dapps/dist/providers/ModalProvider'
import * as modals from 'components/Modals'
import { store, history } from './store'

ReactDOM.render(
  <Provider store={store}>
    <ModalProvider components={modals}>
      <ConnectedRouter history={history}>{/* Your App */}</ConnectedRouter>
    </ModalProvider>
  </Provider>,
  document.getElementById('root')
)
```

where `modals` could look like this:

```ts
// components/Modals/index.ts

export { default as HelpModal } from './HelpModal'
```

Each modal will receive the properties defined on the `ModalComponent` type, found on `modules/modal/types`, so for example:

```tsx
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { ModalProps } from 'decentraland-dapps/dist/modules/modal/types'

type HelpModalProps = ModalProps & {
  // Some custom props, maybe from a container
}

export default class HelpModal extends React.Component<HelpModalProps> {
  render() {
    const { name, metadata, onClose } = this.props
    // The Modal component here can be whatever you like, just make sure to call onClose when you want to close it, to update the state
    // For more examples check the advanced usage
    return <Modal open={true} className={name} onClose={onClose} />
  }
}
```

If want to use [decentraland-ui's Modal](https://github.com/decentraland/ui) but you don't want to repeat the `open`, `className` and `onClose` props, you can use this module's [Modal](https://github.com/decentraland/decentraland-dapps#modal)

**Reducer**:

Add the `modalReducer` as `modal` to your `rootReducer`:

```ts
import { combineReducers } from 'redux'
import { modalReducer as modal } from 'decentraland-dapps/dist/modules/modal/reducer'

export const rootReducer = combineReducers({
  modal
  // your other reducers
})
```

### Advanced Usage

You can have add more strict typing to the actions:

<details><summary>Learn More</summary>
<p>
The modal actions allow for a generic type for the name. So say you want to type the name of your available modals, you can create a `modal` module in your dApp and add the following files:

**Types**:

```ts
// modules/types/actions.ts
import * as modals from 'components/Modals' // same import as the one use for <ModalProvider />

export ModalName = keyof typeof modals
```

**Actions**:

```ts
// modules/modal/actions.ts
import { getModalActions } from 'decentraland-dapps/dist/modules/modal/actions'
import { ModalName } from './types'

const { openModal, closeModal, toggleModal } = getModalActions<ModalName>()

export * from 'decentraland-dapps/dist/modules/modal/actions'
export { openModal, closeModal, toggleModal }
```

</p>
</details>

## Toasts

Leverages redux state and provides actions to show and hide toasts. It provides a few simple actions:

```ts
showToast(toast: Omit<Toast, 'id'>)
hideToast(id: number)
```

You can check the properties a toast has [here](/src/modules/toast/types.ts). It extends the props already defined on [decentraland-ui's toast](https://github.com/decentraland/ui/blob/master/src/components/Toast/Toast.tsx)

It also provides a selector to get the open toasts:

```
getToasts(state): Toast[]
```

### Installation

In order to use this module you need to add a reducer, a provider and a saga.

**Provider**:

Add the `<ToastProvider>` as a parent of your routes. It takes an optional `position` param to set where you want the toasts to appear. It'll default to `top left`

```tsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import ToastProvider from 'decentraland-dapps/dist/providers/ToastProvider'
import * as modals from 'components/Modals'
import { store, history } from './store'

ReactDOM.render(
  <Provider store={store}>
    <ToastProvider position="bottom right">
      <ConnectedRouter history={history}>{/* Your App */}</ConnectedRouter>
    </ToastProvider>
  </Provider>,
  document.getElementById('root')
)
```

**Reducer**:

Add the `toastReducer` as `toast` to your `rootReducer`:

```ts
import { combineReducers } from 'redux'
import { toastReducer as toast } from 'decentraland-dapps/dist/modules/toast/reducer'

export const rootReducer = combineReducers({
  toast
  // your other reducers
})
```

**Saga**:

You will need to create a `toastSaga` and add it to your `rootSaga`:

```ts
import { all } from 'redux-saga/effects'
import { toastSaga } from 'decentraland-dapps/dist/modules/wallet/sagas'

export function* rootSaga() {
  yield all([
    toastSaga()
    // your other sagas here
  ])
}
```

Toasts themselves do not do any async action, but this is needed to render each toast properly, without overloading the redux state with unnecesary information.

## Profile

Leverages the redux state and provides actions and selectors to work with profiles.

### Actions

The module exposes the following actions:

The `loadProfileRequest` action will trigger a profile fetch through the profile sagas that will result, if successful, in the profile metadata being loaded. The success and failure actions of the request action are also included and will be used to signal a successful or a failing request.

The `setProfileAvatarDescriptionRequest` action will trigger a change in the first avatar of the user's profile, that will result in a new entity being deployed for that profile, with the description of the avatar changed for the one specified in the action. The success and failure actions of the request action are also included and will be used to signal a successful or a failing request.

The `clearProfileError` action will clear any profile request errors from the store.

### Installation

To install the profile module, just import it and add it to the store by combining the existing reducers with the one provided in the profile module.

```ts
import { profileReducer as profile } from 'decentraland-dapps/dist/modules/profile/reducer'

export const createRootReducer = (history: History) =>
  combineReducers({
    profile,
    otherReducer
  })

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>
```

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

## ETH

Ethereum helpers

### Pristine Provider

Get user's connected provider without being wrapped by any library

```ts
import { getConnectedProvider } from 'decentraland-dapps/dist/lib/eth'

async function wrapProviderToEthers() {
  const provider = await getConnectedProvider()
  if (provider) {
    return new etheres.providers.Web3Provider(provider)
  }
}
```

### Eth instance

Get an Eth instance with your lib of choice

```ts
import { Eth } from 'web3x/eth'
import { getConnectedProvider } from 'decentraland-dapps/dist/lib/eth'

async function doSomething() {
  const provider = await getConnectedProvider()
  if (!provider) throw new Error()

  // web3x
  const eth = new Eth(provider) // or new Eth(new LegacyProviderAdapter(provider))

  // ethers
  const eth = new ethers.providers.Web3Provider(provider)
}
```

### Helpers

- `isCucumberProvider`: Check if the provider is a `cucumberProvider`.
- `isCoinbaseProvider`: Check if the provider is a `coinbaseProvider`.
- `isDapperProvider`: Check if the provider is a _dapper's_ provider.
- `isValidChainId`: Check if the chain id is valid.

## Entities

The entities library provides a set of methods to retrieve or deploy entities.

### Usage

The `deployEntity` method does everything needed to deploy an entity that doesn't have new files. It pre-procceses the entity to prepare it for the deployment, it creates the auth chain and asks the user to sign the deployment of the entity and then deploys it.

```ts
// lib/entities
import { EntitesOperator } from 'decentraland-dapps/dist/lib/entities'

const URL = 'http://localhost/api'
const profileEntity = { ... }
const entitiesOperator = new EntitesOperator(URL)
await entitiesOperator.deployEntityWithoutNewFiles(
  entity,
  EntityTypes.PROFILE,
  anAddress
)
```

The `getProfileEntity` gets the first profile of all the profiles an address has.

```ts
// lib/entities
import { EntitesOperator } from 'decentraland-dapps/dist/lib/entities'

const URL = 'http://localhost/api'
const entitiesOperator = new EntitesOperator(URL)
await entitiesOperator.getProfile(anAddress)
```

# Containers

Common containers for dApps

## Navbar

The `<Navbar>` container can be used in the same way as the `<Navbar>` component from [decentraland-ui](https://github.com/decentraland/ui) but it's already connected to the redux store. You can override any `NavbarProp` if you want to connect differently, and you can pass all the regular `NavbarProps` to it.

### Dependencies

This container requires you to install the [Wallet](https://github.com/decentraland/decentraland-dapps#wallet). It also has support for i18n out of the box if you include the [Translation](https://github.com/decentraland/decentraland-dapps#translation) module.

### Usage

This is an example of a `SomePage` component that uses the `<Navbar>` container:

```tsx
import * as React from 'react'

import { Container } from 'decentraland-ui/dist/components/Container/Container'
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

</p>
</details>

## Footer

The `<Footer>` container can be used in the same way as the `<Footer>` component from [decentraland-ui](https://github.com/decentraland/ui) but it's already connected to the redux store. You can override any `FooterProps` if you want to connect differently, and you can pass all the regular `FooterProps` to it.

### Dependencies

The `<Footer>` container has support for i18n out of the box if you include the [Translation](https://github.com/decentraland/decentraland-dapps#translation) module.

### Usage

This is an example of a `SomePage` component that uses the `<Footer>` container:

```tsx
import * as React from 'react'

import { Container } from 'decentraland-ui/dist/components/Container/Container'
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

This `<Footer>` will show only English and Spanish as the options in the language dropdown. If you don't provide any it will use only English.

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

</p>
</details>

## SignInPage

The `<SignInPage>` container can be used in the same way as the `<SignIn>` component from [decentraland-ui](https://github.com/decentraland/ui) but it's already connected to the redux store. You can override any `SignInProp` if you want to connect differently, and you can pass all the regular `SignInProps` to it.

### Dependencies

This container requires you to install the [Wallet](https://github.com/decentraland/decentraland-dapps#wallet). It also has support for i18n out of the box if you include the [Translation](https://github.com/decentraland/decentraland-dapps#translation) module.

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

</p>
</details>

## Modal

The `<Modal>` it's a shorthand for some common features used by modals provided to [ModalProvider](https://github.com/decentraland/decentraland-dapps#modal).

### Usage

```tsx
import * as React from 'react'
import Modal from 'decentraland-dapps/dist/containers/Modal'

export default class MyComponent extends React.PureComponent {
  render() {
    return (
      const { name } = this.props

      <Modal name={name} {/* Other Modal props from decentraland ui */>
        <Modal.Header>
        </Modal.Header>
        <Modal.Description>
        </Modal.Description>
      </Modal>
    )
  }
}
```

Behind the scenes Modal is setting the following properties:

```js
open = { true }
className = { name }
size = 'small'
onClose = {
  /*close the modal by name*/
}
```

## TransactionLink

The `<TransactionLink>` can be used to link a transaction hash to Etherscan.io, and it connects to the redux store to know on which network the user is on.

### Dependencies

This container requires you to install the [Wallet](https://github.com/decentraland/decentraland-dapps#wallet) module

### Usage

```tsx
import * as React from 'react'
import TransactionLink from 'decentraland-dapps/dist/containers/TransactionLink'

export default class MyComponent extends React.PureComponent {
  render() {
    return (
      <p>
        You sent an <TransactionLink txHash={'0x...'}>invite</TransactionLink>
      </p>
    )
  }
}
```

# Components

Common Components for dApps

## Intercom

The `<Intercom>` will add an [intercom](https://www.intercom.com/) widget to your app.

### Usage

```tsx
import * as React from 'react'
import Intercom from 'decentraland-dapps/dist/components/Intercom'

export default class MyComponent extends React.PureComponent {
  render() {
    return (
      <div>
        {/* (...) */}
        <Intercom
          appId={YOUR_APP_ID}
          data={/*optional data sent to intercom */}
        />
      </div>
    )
  }
}
```

.
