import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { call, delay, put, race, take } from 'redux-saga/effects'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Provider, connection } from 'decentraland-connect'
import { SWITCH_NETWORK_TIMEOUT, createWalletSaga, getAccount } from './sagas'
import {
  FETCH_WALLET_FAILURE,
  FETCH_WALLET_SUCCESS,
  connectWalletFailure,
  connectWalletRequest,
  connectWalletSuccess,
  disconnectWalletFailure,
  disconnectWalletRequest,
  disconnectWalletSuccess,
  enableWalletFailure,
  enableWalletRequest,
  enableWalletSuccess,
  fetchWalletRequest,
  switchNetworkFailure,
  switchNetworkRequest,
  switchNetworkSuccess,
} from './actions'
import { getConnectedProvider, getNetworkProvider } from '../../lib/eth'
import { switchProviderChainId } from './utils'
import { ProviderType, Wallet } from './types'

const walletSaga = createWalletSaga({ CHAIN_ID: 1 })
const error = 'anErrorMessage'

describe('Wallet sagas', () => {
  let mockProvider: Provider

  beforeAll(async () => {
    mockProvider = await getNetworkProvider(ChainId.ETHEREUM_MAINNET)
  })

  describe('when handling the action to connect the wallet', () => {
    describe('and the fetch wallet request fails', () => {
      it('should dispatch the fetch wallet request, and an action to signal the failure', () => {
        return expectSaga(walletSaga)
          .provide([
            [put(fetchWalletRequest()), undefined],
            [take(FETCH_WALLET_FAILURE), { payload: { error } }],
          ])
          .put(fetchWalletRequest())
          .put(connectWalletFailure(error))
          .dispatch(connectWalletRequest())
          .run({ silenceTimeout: true })
      })
    })

    describe('and the fetch wallet request succeeds', () => {
      let wallet: Wallet

      beforeEach(() => {
        wallet = {} as Wallet
      })

      it('should dispatch the fetch wallet request, and an action to signal the success of the connect wallet', () => {
        return expectSaga(walletSaga)
          .provide([
            [put(fetchWalletRequest()), undefined],
            [take(FETCH_WALLET_SUCCESS), { payload: { wallet } }],
          ])
          .put(fetchWalletRequest())
          .put(connectWalletSuccess(wallet))
          .dispatch(connectWalletRequest())
          .run({ silenceTimeout: true })
      })
    })
  })

  describe('when handling the action to enable the wallet', () => {
    let providerType: ProviderType

    beforeEach(() => {
      providerType = ProviderType.INJECTED
    })

    describe('and cannot retrieve the account', () => {
      const didNotReturnAnyAccountsError = 'Enable did not return any accounts'
      it('should dispatch an action signaling the failure of the enable wallet request', () => {
        return expectSaga(walletSaga)
          .provide([[call(getAccount, providerType), undefined]])
          .put(enableWalletFailure(didNotReturnAnyAccountsError))
          .dispatch(enableWalletRequest(providerType))
          .run({ silenceTimeout: true })
      })
    })

    describe('and the enable returns an account', () => {
      it('should dispatch an action signaling the success of the enable wallet request', () => {
        return expectSaga(walletSaga)
          .provide([[call(getAccount, providerType), 'anAccount']])
          .put(enableWalletSuccess(providerType))
          .dispatch(enableWalletRequest(providerType))
          .run({ silenceTimeout: true })
      })
    })
  })

  describe('when handling the action to switch networks', () => {
    describe('when getting the connected provider fails', () => {
      it('should dispatch an action to signal that the request failed', () => {
        return expectSaga(walletSaga)
          .provide([
            [matchers.call.fn(getConnectedProvider), Promise.resolve(null)],
          ])
          .put(
            switchNetworkFailure(
              ChainId.ETHEREUM_MAINNET,
              'Error switching network: Could not get provider',
            ),
          )
          .dispatch(switchNetworkRequest(ChainId.ETHEREUM_MAINNET))
          .run({ silenceTimeout: true })
      })
    })
    describe('when getting the connected provider succeeds', () => {
      describe('when wallet_switchEthereumChain succeeds', () => {
        it('should dispatch an action to signal that the request succeeded', () => {
          return expectSaga(walletSaga)
            .provide([
              [
                matchers.call.fn(getConnectedProvider),
                Promise.resolve(mockProvider),
              ],
              [
                race({
                  switched: call(
                    switchProviderChainId,
                    mockProvider,
                    ChainId.ETHEREUM_MAINNET,
                  ),
                  timeout: delay(SWITCH_NETWORK_TIMEOUT),
                }),
                { switched: true },
              ],
              [put(fetchWalletRequest()), undefined],
              [
                race({
                  success: take(FETCH_WALLET_SUCCESS),
                  failure: take(FETCH_WALLET_FAILURE),
                }),
                { success: true },
              ],
            ])
            .put(switchNetworkSuccess(ChainId.ETHEREUM_MAINNET))
            .dispatch(switchNetworkRequest(ChainId.ETHEREUM_MAINNET))
            .run({ silenceTimeout: true })
        })
      })
      describe('when wallet_switchEthereumChain fails with code 4902', () => {
        it('should should try to use wallet_addEthereumChain instead', () => {
          const switchError = new Error('Could not switch') as Error & {
            code: number
          }
          switchError.code = 4902
          return expectSaga(walletSaga)
            .provide([
              [
                matchers.call.fn(getConnectedProvider),
                Promise.resolve(mockProvider),
              ],
              [
                call(switchProviderChainId, mockProvider, 1),
                Promise.reject(switchError),
              ],
            ])
            .put(
              switchNetworkFailure(
                ChainId.ETHEREUM_MAINNET,
                'Could not switch',
              ),
            )
            .dispatch(switchNetworkRequest(ChainId.ETHEREUM_MAINNET))
            .run({ silenceTimeout: true })
        })
      })
      describe('when switchProviderChainId timeouts', () => {
        it('should put the failure action', () => {
          return expectSaga(walletSaga)
            .provide([
              [
                matchers.call.fn(getConnectedProvider),
                Promise.resolve(mockProvider),
              ],
              [
                race({
                  switched: call(
                    switchProviderChainId,
                    mockProvider,
                    ChainId.ETHEREUM_MAINNET,
                  ),
                  timeout: delay(SWITCH_NETWORK_TIMEOUT),
                }),
                { timeout: true },
              ],
            ])
            .put(
              switchNetworkFailure(
                ChainId.ETHEREUM_MAINNET,
                'Error switching network: Operation timed out',
              ),
            )
            .dispatch(switchNetworkRequest(ChainId.ETHEREUM_MAINNET))
            .run({ silenceTimeout: true })
        })
      })
    })
  })

  describe('when handling the request action to disconnect a wallet', () => {
    describe('and the disconnection fails', () => {
      let error: string
      beforeEach(() => {
        error = 'Could not disconnect wallet'
      })

      it('should dispatch an action to signal the failure', () => {
        return expectSaga(walletSaga)
          .provide([
            [
              call([connection, 'disconnect']),
              Promise.reject(new Error(error)),
            ],
          ])
          .put(disconnectWalletFailure(error))
          .dispatch(disconnectWalletRequest())
          .run({ silenceTimeout: true })
      })
    })

    describe('and the disconnection succeeds', () => {
      it('should dispatch an action to signal the success', () => {
        return expectSaga(walletSaga)
          .provide([[call([connection, 'disconnect']), Promise.resolve()]])
          .put(disconnectWalletSuccess())
          .dispatch(disconnectWalletRequest())
          .run({ silenceTimeout: true })
      })
    })
  })
})
