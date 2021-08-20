import { ChainId } from '@dcl/schemas'
import { providers, ContractFunction, PopulatedTransaction } from 'ethers'
import * as matchers from 'redux-saga-test-plan/matchers'
import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga/effects'
import {
  ContractName,
  getContract,
  sendMetaTransaction
} from 'decentraland-transactions'
import { getAddress, getChainId } from './selectors'
import {
  getTargetNetworkProvider,
  getTransactionsApiUrl,
  sendWalletTransaction
} from './utils'
import { getConnectedProvider, getNetworkProvider } from '../../lib/eth'

const contract = getContract(ContractName.MANAToken, ChainId.ETHEREUM_MAINNET)

const populate = (mana: {
  [key: string]: ContractFunction<PopulatedTransaction>
}) => mana.transfer('0x0000000000000000000000000000000000000000', '1')

const address = '0x00000000000000000000000000000000deadbeef'

const unsignedTx = { from: address, data: '0xda7a' }

const tx = { hash: '0x00000000000000000000000000000000010b57e6' }

describe('sendWalletTransaction', async () => {
  const mockProvider = await getNetworkProvider(ChainId.ETHEREUM_MAINNET)
  const mockTargetProvider = new providers.Web3Provider(mockProvider)

  describe('when getting the connected address fails', () => {
    it('should throw an error', () => {
      return expectSaga(sendWalletTransaction, contract, populate)
        .provide([[select(getAddress), undefined]])
        .throws(new Error('Invalid address'))
        .silentRun()
    })
  })
  describe('when getting the connected provider fails', () => {
    it('should throw an error', () => {
      return expectSaga(sendWalletTransaction, contract, populate)
        .provide([
          [select(getAddress), address],
          [matchers.call.fn(getConnectedProvider), Promise.resolve(null)]
        ])
        .throws(new Error('Provider not connected'))
        .silentRun()
    })
  })
  describe('when getting the connected provider works', () => {
    describe('when the chainId of the contract is the same as the chainId of the wallet', () => {
      it('should send a regular tx', () => {
        return expectSaga(sendWalletTransaction, contract, populate)
          .provide([
            [select(getAddress), address],
            [
              matchers.call.fn(getConnectedProvider),
              Promise.resolve(mockProvider)
            ],
            [
              call(getTargetNetworkProvider, contract.chainId),
              mockTargetProvider
            ],
            [matchers.call.fn(populate), unsignedTx],
            [select(getChainId), ChainId.ETHEREUM_MAINNET],
            [
              call(
                [mockTargetProvider.getSigner(), 'sendTransaction'],
                unsignedTx
              ),
              tx
            ]
          ])
          .returns(tx.hash)
          .silentRun()
      })
    })
    describe('when the chainId of the contract is different to the chainId of the wallet', () => {
      it('should send a meta tx', () => {
        return expectSaga(sendWalletTransaction, contract, populate)
          .provide([
            [select(getAddress), address],
            [
              matchers.call.fn(getConnectedProvider),
              Promise.resolve(mockProvider)
            ],
            [
              call(getTargetNetworkProvider, contract.chainId),
              mockTargetProvider
            ],
            [matchers.call.fn(populate), unsignedTx],
            [select(getChainId), ChainId.MATIC_MAINNET],
            [
              call(
                sendMetaTransaction,
                mockProvider,
                mockTargetProvider,
                unsignedTx.data,
                contract,
                {
                  serverURL: getTransactionsApiUrl()
                }
              ),
              tx.hash
            ]
          ])
          .returns(tx.hash)
          .silentRun()
      })
    })
  })
})
