import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import {
  CHANGE_ACCOUNT,
  CHANGE_NETWORK,
  CONNECT_WALLET_FAILURE,
  CONNECT_WALLET_REQUEST,
  CONNECT_WALLET_SUCCESS,
  DISCONNECT_WALLET,
  ENABLE_WALLET_FAILURE,
  ENABLE_WALLET_REQUEST,
  ENABLE_WALLET_SUCCESS,
  FETCH_WALLET_FAILURE,
  FETCH_WALLET_REQUEST,
  FETCH_WALLET_SUCCESS,
  SET_APP_CHAIN_ID,
  SWITCH_NETWORK_FAILURE,
  SWITCH_NETWORK_REQUEST,
  SWITCH_NETWORK_SUCCESS,
  changeAccount,
  changeNetwork,
  connectWalletFailure,
  connectWalletRequest,
  connectWalletSuccess,
  disconnectWallet,
  enableWalletFailure,
  enableWalletRequest,
  enableWalletSuccess,
  fetchWalletFailure,
  fetchWalletRequest,
  fetchWalletSuccess,
  setAppChainId,
  switchNetworkFailure,
  switchNetworkRequest,
  switchNetworkSuccess
} from './actions'
import { ProviderType, Wallet } from './types'

const error = 'anErrorMessage'

let wallet: Wallet
let providerType: ProviderType
let chainId: ChainId

beforeEach(() => {
  wallet = {} as Wallet
  providerType = ProviderType.INJECTED
  chainId = ChainId.MATIC_MUMBAI
})

describe('when creating the action to signal the start of the connect wallet request', () => {
  it('should return an object representing the action', () => {
    expect(connectWalletRequest()).toEqual({
      type: CONNECT_WALLET_REQUEST,
      meta: undefined,
      payload: undefined
    })
  })
})

describe('when creating the action to signal a failure in the connect wallet request', () => {
  it('should return an object representing the action', () => {
    expect(connectWalletFailure(error)).toEqual({
      type: CONNECT_WALLET_FAILURE,
      meta: undefined,
      payload: { error }
    })
  })
})

describe('when creating the action to signal a successful connect wallet request', () => {
  it('should return an object representing the action', () => {
    expect(connectWalletSuccess(wallet)).toEqual({
      type: CONNECT_WALLET_SUCCESS,
      meta: undefined,
      payload: { wallet }
    })
  })
})

describe('when creating the action to signal the start of the enable wallet request', () => {
  it('should return an object representing the action', () => {
    expect(enableWalletRequest(providerType)).toEqual({
      type: ENABLE_WALLET_REQUEST,
      meta: undefined,
      payload: { providerType }
    })
  })
})

describe('when creating the action to signal a failure in the enable wallet request', () => {
  it('should return an object representing the action', () => {
    expect(enableWalletFailure(error)).toEqual({
      type: ENABLE_WALLET_FAILURE,
      meta: undefined,
      payload: { error }
    })
  })
})

describe('when creating the action to signal a successful enable wallet request', () => {
  it('should return an object representing the action', () => {
    expect(enableWalletSuccess(providerType)).toEqual({
      type: ENABLE_WALLET_SUCCESS,
      meta: undefined,
      payload: { providerType }
    })
  })
})

describe('when creating the action to signal a change account', () => {
  it('should return an object representing the action', () => {
    expect(changeAccount(wallet)).toEqual({
      type: CHANGE_ACCOUNT,
      meta: undefined,
      payload: { wallet }
    })
  })
})

describe('when creating the action to signal a change network', () => {
  it('should return an object representing the action', () => {
    expect(changeNetwork(wallet)).toEqual({
      type: CHANGE_NETWORK,
      meta: undefined,
      payload: { wallet }
    })
  })
})

describe('when creating the action to signal a disconnect wallet', () => {
  it('should return an object representing the action', () => {
    expect(disconnectWallet()).toEqual({
      type: DISCONNECT_WALLET,
      meta: undefined,
      payload: undefined
    })
  })
})

describe('when creating the action to signal the start of the fetch wallet request', () => {
  it('should return an object representing the action', () => {
    expect(fetchWalletRequest()).toEqual({
      type: FETCH_WALLET_REQUEST,
      meta: undefined,
      payload: undefined
    })
  })
})

describe('when creating the action to signal a failure in the fetch wallet request', () => {
  it('should return an object representing the action', () => {
    expect(fetchWalletFailure(error)).toEqual({
      type: FETCH_WALLET_FAILURE,
      meta: undefined,
      payload: { error }
    })
  })
})

describe('when creating the action to signal a successful fetch wallet request', () => {
  it('should return an object representing the action', () => {
    expect(fetchWalletSuccess(wallet)).toEqual({
      type: FETCH_WALLET_SUCCESS,
      meta: undefined,
      payload: { wallet }
    })
  })
})

describe('when creating the action to signal the start of the switch network request', () => {
  it('should return an object representing the action', () => {
    expect(switchNetworkRequest(chainId)).toEqual({
      type: SWITCH_NETWORK_REQUEST,
      meta: undefined,
      payload: { chainId }
    })
  })
})

describe('when creating the action to signal a failure in the switch network request', () => {
  it('should return an object representing the action', () => {
    expect(switchNetworkFailure(chainId, error)).toEqual({
      type: SWITCH_NETWORK_FAILURE,
      meta: undefined,
      payload: { chainId, error }
    })
  })
})

describe('when creating the action to signal a successful switch network request', () => {
  it('should return an object representing the action', () => {
    expect(switchNetworkSuccess(chainId)).toEqual({
      type: SWITCH_NETWORK_SUCCESS,
      meta: undefined,
      payload: { chainId }
    })
  })
})

describe('when creating the action to signal a set app chain id', () => {
  it('should return an object representing the action', () => {
    expect(setAppChainId(chainId)).toEqual({
      type: SET_APP_CHAIN_ID,
      meta: undefined,
      payload: { chainId }
    })
  })
})
