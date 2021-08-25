import { ChainId } from '@dcl/schemas'
import { ContractFunction, PopulatedTransaction } from 'ethers'
import { expectSaga } from 'redux-saga-test-plan'
import { call, select } from 'redux-saga/effects'
import { ContractName, getContract } from 'decentraland-transactions'
import { getChainId } from './selectors'
import { sendTransaction, sendWalletTransaction } from './utils'

const contract = getContract(ContractName.MANAToken, ChainId.ETHEREUM_MAINNET)

const populate = (mana: {
  [key: string]: ContractFunction<PopulatedTransaction>
}) => mana.transfer('0x0000000000000000000000000000000000000000', '1')

const tx = { hash: '0x00000000000000000000000000000000010b57e6' }

describe('sendWalletTransaction', async () => {
  describe('when getting the connected chain id fails', () => {
    it('should throw an error', () => {
      return expectSaga(sendWalletTransaction, contract, populate)
        .provide([[select(getChainId), undefined]])
        .throws(new Error('Invalid chain id'))
        .silentRun()
    })
  })
  describe('when getting the connected chain id works', () => {
    describe('when the chainId of the contract is the same as the chainId of the wallet', () => {
      it('should send a regular tx', () => {
        return expectSaga(sendWalletTransaction, contract, populate)
          .provide([
            [select(getChainId), ChainId.ETHEREUM_MAINNET],
            [
              call(
                sendTransaction,
                ChainId.ETHEREUM_MAINNET,
                contract,
                populate
              ),
              tx.hash
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
            [select(getChainId), ChainId.MATIC_MAINNET],
            [
              call(sendTransaction, ChainId.MATIC_MAINNET, contract, populate),
              tx.hash
            ]
          ])
          .returns(tx.hash)
          .silentRun()
      })
    })
  })
})
