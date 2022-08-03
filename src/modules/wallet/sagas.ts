import { ethers } from 'ethers'
import {
  put,
  call,
  all,
  takeEvery,
  race,
  take,
  delay,
  select,
  fork
} from 'redux-saga/effects'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { connection, Provider } from 'decentraland-connect'
import {
  _getAppChainId,
  getConnectedProvider,
  isCucumberProvider,
  isValidChainId,
  _setAppChainId
} from '../../lib/eth'
import {
  connectWalletSuccess,
  connectWalletFailure,
  CONNECT_WALLET_REQUEST,
  EnableWalletRequestAction,
  enableWalletFailure,
  enableWalletSuccess,
  EnableWalletSuccessAction,
  connectWalletRequest,
  ENABLE_WALLET_REQUEST,
  ENABLE_WALLET_SUCCESS,
  DisconnectWalletAction,
  disconnectWallet,
  DISCONNECT_WALLET,
  FETCH_WALLET_REQUEST,
  FetchWalletRequestAction,
  fetchWalletSuccess,
  fetchWalletFailure,
  fetchWalletRequest,
  FETCH_WALLET_SUCCESS,
  FETCH_WALLET_FAILURE,
  FetchWalletSuccessAction,
  FetchWalletFailureAction,
  CONNECT_WALLET_SUCCESS,
  SWITCH_NETWORK_REQUEST,
  SwitchNetworkRequestAction,
  switchNetworkSuccess,
  switchNetworkFailure,
  SWITCH_NETWORK_SUCCESS,
  SwitchNetworkSuccessAction,
  setAppChainId
} from './actions'
import {
  buildWallet,
  getTransactionsApiUrl,
  setTransactionsApiUrl,
  switchProviderChainId
} from './utils'
import { CreateWalletOptions, Wallet } from './types'
import { getAppChainId, isConnected } from './selectors'

// Patch Samsung's Cucumber provider send to support promises
const provider = (window as any).ethereum as ethers.providers.Web3Provider

let cucumberProviderSend: (...args: any[]) => Promise<string[]>
if (isCucumberProvider()) {
  const _send = provider.send
  cucumberProviderSend = (...args: any[]) => {
    try {
      return Promise.resolve(_send.apply(provider, args)).then(
        accounts => accounts?.result || []
      )
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

// Can be set on createWalletSaga
let POLL_INTERVAL = 5 * 60 * 1000 // 60 seconds
let polling = false

export function* walletSaga() {
  yield fork(initializeAppChainId)
  yield all([
    takeEvery(CONNECT_WALLET_REQUEST, handleConnectWalletRequest),
    takeEvery(ENABLE_WALLET_REQUEST, handleEnableWalletRequest),
    takeEvery(ENABLE_WALLET_SUCCESS, handleEnableWalletSuccess),
    takeEvery(FETCH_WALLET_REQUEST, handleFetchWalletRequest),
    takeEvery(DISCONNECT_WALLET, handleDisconnectWallet),
    takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess),
    takeEvery(SWITCH_NETWORK_REQUEST, handleSwitchNetworkRequest),
    takeEvery(SWITCH_NETWORK_SUCCESS, handleSwitchNetworkSucces)
  ])
}

function* initializeAppChainId() {
  // store the app chain id in redux to use it from selectors or sagas
  yield put(setAppChainId(_getAppChainId()))
}

function* handleConnectWalletRequest() {
  try {
    yield put(fetchWalletRequest())
    const {
      success,
      failure
    }: {
      success: FetchWalletSuccessAction | null
      failure: FetchWalletFailureAction | null
    } = yield race({
      success: take(FETCH_WALLET_SUCCESS),
      failure: take(FETCH_WALLET_FAILURE)
    })
    if (success) {
      yield put(connectWalletSuccess(success.payload.wallet))
    } else {
      throw new Error(failure!.payload.error)
    }
  } catch (error) {
    yield put(disconnectWallet())
    yield put(connectWalletFailure(error.message))
  }
}

function* handleEnableWalletRequest(action: EnableWalletRequestAction) {
  const { providerType } = action.payload
  try {
    const account: string = yield call(async () => {
      if (isCucumberProvider()) {
        await cucumberProviderSend('eth_requestAccounts')
      }

      const { account } = await connection.connect(
        providerType,
        _getAppChainId()
      )
      return account
    })

    if (!account) {
      throw new Error('Enable did not return any accounts')
    }
    yield put(enableWalletSuccess(providerType))
  } catch (error) {
    yield put(disconnectWallet())
    yield put(enableWalletFailure(error.message))
  }
}

function* handleEnableWalletSuccess(_action: EnableWalletSuccessAction) {
  yield put(connectWalletRequest())
}

function* handleDisconnectWallet(_action: DisconnectWalletAction) {
  try {
    yield call(() => connection.disconnect())
  } catch (error) {
    console.error(error)
  }
  // stop polling wallet balances
  polling = false
}

function* handleFetchWalletRequest(_action: FetchWalletRequestAction) {
  try {
    const appChainId: ChainId = yield select(getAppChainId)
    const wallet: Wallet = yield call(buildWallet, appChainId)
    yield put(fetchWalletSuccess(wallet))
  } catch (error) {
    yield put(fetchWalletFailure(error.message))
  }
}

function* handleConnectWalletSuccess() {
  // poll wallet balances
  if (!polling && POLL_INTERVAL > 0) {
    polling = true
    while (polling) {
      yield delay(POLL_INTERVAL)
      const isWalletConnected: boolean = yield select(isConnected)
      if (isWalletConnected) {
        yield put(fetchWalletRequest())
      }
    }
  }
}

function* handleSwitchNetworkRequest(action: SwitchNetworkRequestAction) {
  const { chainId } = action.payload
  const provider: Provider | null = yield call(getConnectedProvider)

  if (!provider) {
    yield put(
      switchNetworkFailure(
        chainId,
        'Error switching network: Could not get provider'
      )
    )
  } else {
    try {
      yield call(switchProviderChainId, provider, chainId)
      yield put(switchNetworkSuccess(chainId))
    } catch (switchError) {
      yield put(switchNetworkFailure(chainId, switchError.message))
    }
  }
}

function* handleSwitchNetworkSucces(_action: SwitchNetworkSuccessAction) {
  yield put(fetchWalletRequest())
}

export function createWalletSaga(options: CreateWalletOptions) {
  if (isValidChainId(options.CHAIN_ID)) {
    _setAppChainId(Number(options.CHAIN_ID))
  } else {
    throw new Error(
      `Invalid Chain id ${options.CHAIN_ID}. Valid options are ${Object.values(
        ChainId
      )}`
    )
  }

  if (options.MANA_ADDRESS) {
    console.warn(
      'Deprecated notice: the MANA_ADDRESS option on `createWalletSaga` has been deprecated and will be removed in future version.'
    )
  }

  if (options.POLL_INTERVAL) {
    POLL_INTERVAL = options.POLL_INTERVAL
  }

  if (options.TRANSACTIONS_API_URL) {
    setTransactionsApiUrl(options.TRANSACTIONS_API_URL)
  } else {
    console.warn(
      `"TRANSACTIONS_API_URL" not provided on createWalletSaga, using default value "${getTransactionsApiUrl()}".`
    )
  }

  return walletSaga
}
