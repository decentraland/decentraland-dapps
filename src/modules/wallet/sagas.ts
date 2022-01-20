import { LegacyProvider } from 'web3x/providers'
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
  getConnectedProvider,
  isCucumberProvider,
  isValidChainId
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
  getAddEthereumChainParameters,
  getTransactionsApiUrl,
  setTransactionsApiUrl
} from './utils'
import { CreateWalletOptions, Wallet } from './types'
import { isConnected } from './selectors'

// Patch Samsung's Cucumber provider send to support promises
const provider = (window as any).ethereum as LegacyProvider

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
let CHAIN_ID: ChainId
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
  yield put(setAppChainId(CHAIN_ID))
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
  try {
    if (!provider) {
      throw new Error('Could not get provider')
    }
    yield call([provider, 'request'], {
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + chainId.toString(16) }]
    })
    yield put(switchNetworkSuccess(chainId))
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (provider && switchError.code === 4902) {
      try {
        yield call([provider, 'request'], {
          method: 'wallet_addEthereumChain',
          params: [getAddEthereumChainParameters(chainId)]
        })
        const newChainId: string = yield call([provider, 'request'], {
          method: 'eth_chainId',
          params: []
        })
        if (chainId !== parseInt(newChainId, 16)) {
          throw new Error('chainId did not change after adding network')
        }
        yield put(switchNetworkSuccess(chainId))
        return
      } catch (addError) {
        yield put(
          switchNetworkFailure(
            chainId,
            `Error adding network: ${addError.message}`
          )
        )
        return
      }
    }
    yield put(
      switchNetworkFailure(
        chainId,
        `Error switching network: ${switchError.message}`
      )
    )
  }
}

function* handleSwitchNetworkSucces(_action: SwitchNetworkSuccessAction) {
  yield put(fetchWalletRequest())
}

export function createWalletSaga(options: CreateWalletOptions) {
  if (isValidChainId(options.CHAIN_ID)) {
    CHAIN_ID = Number(options.CHAIN_ID)
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
