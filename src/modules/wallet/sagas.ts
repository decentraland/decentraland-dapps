import { LegacyProvider } from 'web3x-es/providers'
import { put, call, all, takeEvery } from 'redux-saga/effects'
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
  DISCONNECT_WALLET
} from './actions'
import { buildWallet } from './utils'
import { CreateWalletOptions } from './types'

// Patch Samsung's Cucumber provider send to support promises
const provider = (window as any).ethereum as LegacyProvider

let cucumberProviderSend: Function
if (isCucumberProvider()) {
  const _send = provider.send
  cucumberProviderSend = (...args: any[]) => {
    try {
      return Promise.resolve(_send.apply(provider, args))
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

// Can be set on createWalletSaga
let CHAIN_ID: ChainId = ChainId.ETHEREUM_MAINNET

function* handleConnectWalletRequest() {
  try {
    const wallet = yield call(() => buildWallet())
    yield put(connectWalletSuccess(wallet))
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
        const accounts = cucumberProviderSend('eth_requestAccounts')
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
}

export function* walletSaga() {
  yield all([
    takeEvery(CONNECT_WALLET_REQUEST, handleConnectWalletRequest),
    takeEvery(ENABLE_WALLET_REQUEST, handleEnableWalletRequest),
    takeEvery(ENABLE_WALLET_SUCCESS, handleEnableWalletSuccess),
    takeEvery(DISCONNECT_WALLET, handleDisconnectWallet)
  ])
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
  }
  return walletSaga
}
