import {
  call,
  select,
  takeEvery,
  put,
  ForkEffect,
  all
} from 'redux-saga/effects'
import { eth, Contract } from 'decentraland-eth'
import { EthereumWindow, BaseWallet } from './types'
import {
  connectWalletSuccess,
  connectWalletFailure,
  CONNECT_WALLET_REQUEST
} from './actions'
import { isApprovableWallet, connectEthereumWallet } from './utils'
import { getData } from './selectors'

export type WalletSagaOptions = {
  provider: object | string
  contracts: Contract[]
  eth: typeof eth
}

export function createWalletSaga({
  provider,
  contracts,
  eth
}: WalletSagaOptions): () => IterableIterator<ForkEffect> {
  function* handleConnectWalletRequest() {
    try {
      if (isApprovableWallet()) {
        const { ethereum } = window as EthereumWindow
        yield call(() => ethereum!.enable!())

        // Unfortunately we need to override the provider supplied to this method
        // if we're dealing with approbable wallets (the first being Metamask, probably more to come).
        // When a wallet is needs to call `enable` to work (to whitelist the URL), the correct provider is `ethereum`
        // but if we're using a different kind of wallet (like a Ledger) the user supplied provider should be ok.
        provider = ethereum!
      }

      const walletData: BaseWallet = yield select(getData)

      yield call(() =>
        connectEthereumWallet({
          address: walletData.address,
          derivationPath: walletData.derivationPath,
          provider,
          contracts,
          eth
        })
      )

      let address: string = yield call(() => eth.getAddress())
      address = address.toLowerCase()

      const manaTokenContract = eth.getContract('MANAToken')

      const [network, mana] = yield all([
        eth.getNetwork(),
        manaTokenContract.balanceOf(address)
      ])

      const wallet: BaseWallet = {
        address,
        mana,
        network: network.name,
        type: eth.wallet.type,
        derivationPath: eth.wallet.derivationPath
      }

      yield put(connectWalletSuccess(wallet))
    } catch (error) {
      yield put(connectWalletFailure(error.message))
    }
  }

  return function* walletSaga() {
    yield takeEvery(CONNECT_WALLET_REQUEST, handleConnectWalletRequest)
  }
}
