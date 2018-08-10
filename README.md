# Decentraland dApps

Common parts for our dApps

# Table of Contents

- [Modules](https://github.com/decentraland/decentraland-dapps#modules)
  - [Wallet](https://github.com/decentraland/decentraland-dapps#wallet)

# Modules

## Wallet

This module takes care of connecting to MetaMask/Ledger, and insert in the state some useful information like address, network, mana and derivationPath.

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

Also you can que types for those actions from that same file:

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
import WalletProvier from 'decentraland-dapps/dist/providers/WalletProvider'
import { store, history } from './store'

ReactDOM.render(
  <Provider store={store}>
    <WalletProvier>
      <ConnectedRouter history={history}>{/* Your App */}</ConnectedRouter>
    </WalletProvier>
  </Provider>,
  document.getElementById('root')
)
```

**Reducer**:

Import the `walletReducer` and add it at the root level of your dapp's reducer as `wallet`, like this:

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
import { createWalletSaga } from '@dapps/modules/wallet/sagas'

const manaToken = new contracts.MANAToken('0xdeadbeeffaceb00c') // contract address here

const walletSaga = createWalletSaga({
  provider: 'https://mainnet.infura.io', // this param is required to have Ledger support
  contracts: [manaToken], // add all the contracts you will use here, but manaToken is required!
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

You can extend the wallet module if you need to. Say you want to add the amount of `land` as a property of the wallet, you can create a `wallet` module in your dapp and add the following files:

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
    case FETCH_WALLET_LAND_AMOUNT_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          land: action.land
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
  provider: env.get('REACT_APP_PROVIDER_URL'),
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
