import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { call } from 'redux-saga/effects'
import { ChainId } from '@dcl/schemas'
import { createWalletSaga } from './sagas'
import {
  switchNetworkFailure,
  switchNetworkRequest,
  switchNetworkSuccess
} from './actions'
import { getConnectedProvider, getNetworkProvider } from '../../lib/eth'
import { getAddEthereumChainParameters } from './utils'

const walletSaga = createWalletSaga({ CHAIN_ID: 1 })

describe('Wallet sagas', async () => {
  const mockProvider = await getNetworkProvider(ChainId.ETHEREUM_MAINNET)

  describe('when handling the action to switch networks', () => {
    describe('when getting the connected provider fails', () => {
      it('should dispatch an action to signal that the request failed', () => {
        return expectSaga(walletSaga)
          .provide([
            [matchers.call.fn(getConnectedProvider), Promise.resolve(null)]
          ])
          .put(
            switchNetworkFailure(
              ChainId.ETHEREUM_MAINNET,
              'Error switching network: Could not get provider'
            )
          )
          .dispatch(switchNetworkRequest(ChainId.ETHEREUM_MAINNET))
          .run({ silenceTimeout: true })
      })
    })
    describe('when getting the connected provider succeeds', () => {
      describe('when wallet_switchEthereumChain succeeds', () => {
        it('should dispatch an action to signal that the request succeded', () => {
          return expectSaga(walletSaga)
            .provide([
              [
                matchers.call.fn(getConnectedProvider),
                Promise.resolve(mockProvider)
              ],
              [
                call([mockProvider, 'request'], {
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x1' }]
                }),
                Promise.resolve(void 0)
              ]
            ])
            .put(switchNetworkSuccess(ChainId.ETHEREUM_MAINNET))
            .dispatch(switchNetworkRequest(ChainId.ETHEREUM_MAINNET))
            .run({ silenceTimeout: true })
        })
      })
      describe('when wallet_switchEthereumChain fails', () => {
        it('should should try to use wallet_addEthereumChain instead', () => {
          const switchError = new Error('Could not switch') as Error & {
            code: number
          }
          switchError.code = 4902
          return expectSaga(walletSaga)
            .provide([
              [
                matchers.call.fn(getConnectedProvider),
                Promise.resolve(mockProvider)
              ],
              [
                call([mockProvider, 'request'], {
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x1' }]
                }),
                Promise.reject(switchError)
              ],
              [
                call([mockProvider, 'request'], {
                  method: 'wallet_addEthereumChain',
                  params: [
                    getAddEthereumChainParameters(ChainId.ETHEREUM_MAINNET)
                  ]
                }),
                Promise.resolve()
              ],
              [
                call([mockProvider, 'request'], {
                  method: 'eth_chainId',
                  params: []
                }),
                Promise.resolve('0x1')
              ]
            ])
            .put(switchNetworkSuccess(ChainId.ETHEREUM_MAINNET))
            .dispatch(switchNetworkRequest(ChainId.ETHEREUM_MAINNET))
            .run({ silenceTimeout: true })
        })
        it('should should fail if after using wallet_addEthereumChain the chainId did not change', () => {
          const switchError = new Error('Could not switch') as Error & {
            code: number
          }
          switchError.code = 4902
          return expectSaga(walletSaga)
            .provide([
              [
                matchers.call.fn(getConnectedProvider),
                Promise.resolve(mockProvider)
              ],
              [
                call([mockProvider, 'request'], {
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x1' }]
                }),
                Promise.reject(switchError)
              ],
              [
                call([mockProvider, 'request'], {
                  method: 'wallet_addEthereumChain',
                  params: [
                    getAddEthereumChainParameters(ChainId.ETHEREUM_MAINNET)
                  ]
                }),
                Promise.resolve()
              ],
              [
                call([mockProvider, 'request'], {
                  method: 'eth_chainId',
                  params: []
                }),
                Promise.resolve('0x2')
              ]
            ])
            .put(
              switchNetworkFailure(
                ChainId.ETHEREUM_MAINNET,
                'Error adding network: chainId did not change after adding network'
              )
            )
            .dispatch(switchNetworkRequest(ChainId.ETHEREUM_MAINNET))
            .run({ silenceTimeout: true })
        })
      })
    })
  })
})
