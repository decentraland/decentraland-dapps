import { call, select, takeEvery, put, ForkEffect } from 'redux-saga/effects'
import { eth, Contract } from 'decentraland-eth'
import { Network } from 'decentraland-eth/dist/ethereum/eth'
import { CONNECT_WALLET_REQUEST, BaseWallet } from './types'
import { connectWalletSuccess, connectWalletFailure } from './actions'
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

      const network: Network = yield call(eth.getNetwork)

      const wallet: BaseWallet = {
        address,
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
