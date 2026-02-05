import { Web3Provider } from '@ethersproject/providers'
import { all, call, delay, fork, put, race, select, take, takeEvery } from 'redux-saga/effects'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Provider, connection } from 'decentraland-connect'
import { isErrorWithMessage } from '../../lib'
import { _getAppChainId, _setAppChainId, getConnectedProvider, isCucumberProvider, isValidChainId } from '../../lib/eth'
import { showToast } from '../toast'
import { getSwitchChainErrorToast } from '../toast/toasts'
import {
  CONNECT_WALLET_REQUEST,
  CONNECT_WALLET_SUCCESS,
  DISCONNECT_WALLET_REQUEST,
  DisconnectWalletRequestAction,
  ENABLE_WALLET_REQUEST,
  ENABLE_WALLET_SUCCESS,
  EnableWalletRequestAction,
  EnableWalletSuccessAction,
  FETCH_WALLET_FAILURE,
  FETCH_WALLET_REQUEST,
  FETCH_WALLET_SUCCESS,
  FetchWalletFailureAction,
  FetchWalletRequestAction,
  FetchWalletSuccessAction,
  SWITCH_NETWORK_REQUEST,
  SwitchNetworkRequestAction,
  connectWalletFailure,
  connectWalletRequest,
  connectWalletSuccess,
  disconnectWalletFailure,
  disconnectWalletSuccess,
  enableWalletFailure,
  enableWalletSuccess,
  fetchWalletFailure,
  fetchWalletRequest,
  fetchWalletSuccess,
  setAppChainId,
  switchNetworkFailure,
  switchNetworkSuccess
} from './actions'
import { getAppChainId, isConnected } from './selectors'
import { CreateWalletOptions, ProviderType, Wallet } from './types'
import { getTransactionsApiUrl, setTransactionsApiUrl } from './utils'
import { buildWallet } from './utils/buildWallet'
import { switchProviderChainId } from './utils/switchProviderChainId'

// Patch Samsung's Cucumber provider send to support promises
const provider = (window as any).ethereum as Web3Provider

export const SWITCH_NETWORK_TIMEOUT = 10000 // 10 seconds

let cucumberProviderSend: (...args: any[]) => Promise<string[]>
if (isCucumberProvider()) {
  const _send = provider.send
  cucumberProviderSend = (...args: any[]) => {
    try {
      return Promise.resolve(_send.apply(provider, args)).then(accounts => accounts?.result || [])
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

export async function getAccount(providerType: ProviderType) {
  if (isCucumberProvider()) {
    await cucumberProviderSend('eth_requestAccounts')
  }

  const { account } = await connection.connect(
    providerType === ProviderType.WALLET_CONNECT ? ProviderType.WALLET_CONNECT_V2 : providerType,
    _getAppChainId()
  )

  return account
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
    takeEvery(DISCONNECT_WALLET_REQUEST, handleDisconnectWalletRequest),
    takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess),
    takeEvery(SWITCH_NETWORK_REQUEST, handleSwitchNetworkRequest)
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
    yield put(connectWalletFailure(error.message))
  }
}

function* handleEnableWalletRequest(action: EnableWalletRequestAction) {
  const { providerType } = action.payload
  try {
    const account: string = yield call(getAccount, providerType)

    if (!account) {
      throw new Error('Enable did not return any accounts')
    }
    yield put(enableWalletSuccess(providerType))
  } catch (error) {
    yield put(enableWalletFailure(error.message))
  }
}

function* handleEnableWalletSuccess(_action: EnableWalletSuccessAction) {
  yield put(connectWalletRequest())
}

function* handleDisconnectWalletRequest(_action: DisconnectWalletRequestAction) {
  try {
    yield call([connection, 'disconnect'])
    yield put(disconnectWalletSuccess())
  } catch (error) {
    yield put(disconnectWalletFailure(isErrorWithMessage(error) ? error.message : 'Error disconnecting wallet'))
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
    yield put(switchNetworkFailure(chainId, 'Error switching network: Could not get provider'))
  } else {
    try {
      const { timeout } = yield race({
        switched: call(switchProviderChainId, provider, chainId),
        timeout: delay(SWITCH_NETWORK_TIMEOUT) // 10 seconds timeout
      })

      if (timeout) {
        yield put(showToast(getSwitchChainErrorToast(chainId)))
        throw new Error('Error switching network: Operation timed out')
      } else {
        yield put(fetchWalletRequest())
        yield race({
          success: take(FETCH_WALLET_SUCCESS),
          failure: take(FETCH_WALLET_FAILURE)
        })
        yield put(switchNetworkSuccess(chainId))
      }
    } catch (switchError) {
      yield put(switchNetworkFailure(chainId, switchError.message))
    }
  }
}

export function createWalletSaga(options: CreateWalletOptions) {
  if (isValidChainId(options.CHAIN_ID)) {
    _setAppChainId(Number(options.CHAIN_ID))
  } else {
    throw new Error(`Invalid Chain id ${options.CHAIN_ID}. Valid options are ${Object.values(ChainId)}`)
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
    console.warn(`"TRANSACTIONS_API_URL" not provided on createWalletSaga, using default value "${getTransactionsApiUrl()}".`)
  }

  return walletSaga
}
