import {
  call,
  select,
  takeEvery,
  put,
  ForkEffect,
  all
} from 'redux-saga/effects'
import { eth, Contract } from 'decentraland-eth'
import { BaseWallet } from './types'
import {
  connectWalletSuccess,
  connectWalletFailure,
  CONNECT_WALLET_REQUEST
} from './actions'
import { connectEthereumWallet } from './utils'
import { getData } from './selectors'

export type WalletSagaOptions = {
  provider: string
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
      if (!eth.isConnected()) {
        const { address, derivationPath } = yield select(getData)

        yield call(() =>
          connectEthereumWallet({
            address,
            derivationPath,
            provider,
            contracts,
            eth
          })
        )
      }

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
