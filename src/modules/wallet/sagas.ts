import { put, call, all, takeEvery } from 'redux-saga/effects'
import { isMobile, isCucumberProvider } from '../../lib/utils'
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
  ENABLE_WALLET_SUCCESS
} from './actions'
import { getWallet } from './utils'

// Patch Samsung's Cucumber provider send to support promises
const provider = (window as any).ethereum

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

function patchProvider(provider?: any) {
  // Patch for old providers and mobile providers which do not use promises at send as sendAsync
  if (
    provider &&
    typeof provider.sendAsync === 'function' &&
    provider.send !== provider.sendAsync
  ) {
    provider.send = provider.sendAsync
  }
}

function* handleConnectWalletRequest() {
  try {
    const provider = (window as any).ethereum

    if (isMobile()) {
      patchProvider(provider)
      const web3 = (window as any).web3
      if (web3) {
        patchProvider(web3.currentProvider)
        patchProvider(web3.ethereumProvider)
      }
    }

    // Prevent metamask from auto refreshing the page
    if (provider) {
      provider.autoRefreshOnNetworkChange = false
    }

    const wallet = yield call(() => getWallet())
    yield put(connectWalletSuccess(wallet))
  } catch (error) {
    yield put(connectWalletFailure(error.message))
  }
}

function* handleEnableWalletRequest(_action: EnableWalletRequestAction) {
  try {
    const accounts: string[] = yield call(() => {
      const provider = (window as any).ethereum
      if (isCucumberProvider()) {
        return cucumberProviderSend('eth_requestAccounts')
      }

      if (provider && provider.enable) {
        return provider.enable()
      }

      console.warn('Provider not found')
      return []
    })

    if (accounts.length === 0) {
      throw new Error('Enable did not return any accounts')
    }
    yield put(enableWalletSuccess())
  } catch (error) {
    yield put(enableWalletFailure(error.message))
  }
}

function* handleEnableWalletSuccess(_action: EnableWalletSuccessAction) {
  yield put(connectWalletRequest())
}

export function* walletSaga() {
  yield all([
    takeEvery(CONNECT_WALLET_REQUEST, handleConnectWalletRequest),
    takeEvery(ENABLE_WALLET_REQUEST, handleEnableWalletRequest),
    takeEvery(ENABLE_WALLET_SUCCESS, handleEnableWalletSuccess)
  ])
}

export function createWalletSaga(
  // @ts-ignore
  options?: { MANA_ADDRESS: string }
) {
  console.warn(
    'Deprecated notice: `createWalletSaga` has been deprecated and will be removed in future version, use `walletSaga` instead.'
  )
  return walletSaga
}
