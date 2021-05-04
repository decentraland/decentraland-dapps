import { LegacyProvider } from 'web3x-es/providers'
import {
  put,
  call,
  all,
  takeEvery,
  race,
  take,
  delay,
  select
} from 'redux-saga/effects'
import { ChainId } from '@dcl/schemas'
import { connection } from 'decentraland-connect'
import { isCucumberProvider, isValidChainId } from '../../lib/eth'
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
  CONNECT_WALLET_SUCCESS
} from './actions'
import { buildWallet } from './utils'
import { CreateWalletOptions, Wallet } from './types'
import { isConnected } from './selectors'

// Patch Samsung's Cucumber provider send to support promises
const provider = (window as any).ethereum as LegacyProvider

let cucumberProviderSend: (...args: any[]) => Promise<string[]>
if (isCucumberProvider()) {
  const _send = provider.send
  cucumberProviderSend = (...args: any[]) => {
    try {
      return Promise.resolve(_send.apply(provider, args))
        .then(accounts => accounts?.result || [])
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

// Can be set on createWalletSaga
let CHAIN_ID: ChainId = ChainId.ETHEREUM_MAINNET
let POLL_INTERVAL = 60 * 1000 // 60 seconds
let polling = false

export function* walletSaga() {
  yield all([
    takeEvery(CONNECT_WALLET_REQUEST, handleConnectWalletRequest),
    takeEvery(ENABLE_WALLET_REQUEST, handleEnableWalletRequest),
    takeEvery(ENABLE_WALLET_SUCCESS, handleEnableWalletSuccess),
    takeEvery(FETCH_WALLET_REQUEST, handleFetchWalletRequest),
    takeEvery(DISCONNECT_WALLET, handleDisconnectWallet),
    takeEvery(CONNECT_WALLET_SUCCESS, handleConnectWalletSuccess)
  ])
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
        const accounts = await cucumberProviderSend('eth_requestAccounts')
        return accounts[0]
      }

      const { account } = await connection.connect(providerType, CHAIN_ID)
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
    const wallet: Wallet = yield call(buildWallet)
    yield put(fetchWalletSuccess(wallet))
  } catch (error) {
    yield put(fetchWalletFailure(error.message))
  }
}

function* handleConnectWalletSuccess() {
  // poll wallet balances
  if (!polling) {
    polling = true
    while (polling) {
      yield delay(POLL_INTERVAL)
      if (yield select(isConnected)) {
        yield put(fetchWalletRequest())
      }
    }
  }
}

export function createWalletSaga(options?: CreateWalletOptions) {
  if (options) {
    if (options.MANA_ADDRESS) {
      console.warn(
        'Deprecated notice: the MANA_ADDRESS option on `createWalletSaga` has been deprecated and will be removed in future version.'
      )
    }

    if (options.CHAIN_ID) {
      if (isValidChainId(options.CHAIN_ID)) {
        CHAIN_ID = Number(options.CHAIN_ID)
      } else {
        console.warn(
          `Invalid Chain id ${options.CHAIN_ID}, defaulting to ${CHAIN_ID}`
        )
      }
    }

    if (options.POLL_INTERVAL) {
      POLL_INTERVAL = options.POLL_INTERVAL
    }
  }
  return walletSaga
}
