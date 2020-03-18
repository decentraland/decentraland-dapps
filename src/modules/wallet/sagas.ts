import { Eth } from 'web3x-es/eth'
import { Address } from 'web3x-es/address'
import { fromWei } from 'web3x-es/utils'
import { put, call, all, takeEvery } from 'redux-saga/effects'
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
  ChangeAccountAction,
  ChangeNetworkAction,
  CHANGE_ACCOUNT,
  CHANGE_NETWORK
} from './actions'
import { isMobile } from '../../lib/utils'
import { MANA } from '../../contracts/MANA'
import { Wallet } from './types'

export type WalletSagaOptions = {
  MANA_ADDRESS: string
}

export function createWalletSaga(
  options: WalletSagaOptions = {
    MANA_ADDRESS: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942'
  }
) {
  const { MANA_ADDRESS } = options
  function* handleConnectWalletRequest() {
    try {
      // Hack for old providers and mobile providers which does not have a hack to convert send to sendAsync
      const provider = (window as any).ethereum
      if (
        isMobile() &&
        provider &&
        typeof provider.sendAsync === 'function' &&
        provider.send !== provider.sendAsync
      ) {
        provider.send = provider.sendAsync
      }

      const eth = Eth.fromCurrentProvider()
      if (!eth) {
        // this could happen if metamask is not installed
        throw new Error('Could not connect to Ethereum')
      }
      let accounts: Address[] = yield call(() => eth.getAccounts())
      if (accounts.length === 0) {
        // This could happen if metamask was not enabled
        throw new Error('Could not get address')
      }
      const address = accounts[0]
      const network = yield call(() => eth.getId())
      const ethBalance = yield call(() => eth.getBalance(address))
      const mana = new MANA(eth, Address.fromString(MANA_ADDRESS))
      let manaBalance
      try {
        manaBalance = yield call(() => mana.methods.balanceOf(address).call())
      } catch (e) {
        // Temporary fix. We should detect that the user should change the network
        console.warn(
          'Could not get MANA balance. Are you in the right network?'
        )
        manaBalance = '0'
      }

      const wallet: Wallet = {
        address: address.toString(),
        mana: parseFloat(fromWei(manaBalance, 'ether')),
        eth: parseFloat(fromWei(ethBalance, 'ether')),
        network
      }

      yield put(connectWalletSuccess(wallet))
    } catch (error) {
      yield put(connectWalletFailure(error.message))
    }
  }

  function* handleEnableWalletRequest(_action: EnableWalletRequestAction) {
    try {
      const accounts: string[] = yield call(() => {
        const provider = (window as any).ethereum
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

  function* handleChangeAccount(_action: ChangeAccountAction) {
    yield put(connectWalletRequest())
  }

  function* handleChangeNetwork(_action: ChangeNetworkAction) {
    yield put(connectWalletRequest())
  }

  return function* walletSaga() {
    yield all([
      takeEvery(CONNECT_WALLET_REQUEST, handleConnectWalletRequest),
      takeEvery(ENABLE_WALLET_REQUEST, handleEnableWalletRequest),
      takeEvery(ENABLE_WALLET_SUCCESS, handleEnableWalletSuccess),
      takeEvery(CHANGE_ACCOUNT, handleChangeAccount),
      takeEvery(CHANGE_NETWORK, handleChangeNetwork)
    ])
  }
}

export const walletSaga = createWalletSaga()
