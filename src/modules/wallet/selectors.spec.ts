import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { connectWalletRequest, enableWalletRequest } from './actions'
import { INITIAL_STATE, WalletState } from './reducer'
import {
  getAddress,
  getAppChainId,
  getChainId,
  getData,
  getError,
  getLoading,
  getNetwork,
  getNetworks,
  getProviderType,
  getState,
  isConnected,
  isConnecting,
  isEnabling
} from './selectors'
import { NetworkData, ProviderType, Wallet } from './types'
import { Networks } from './types'

let initialState: { wallet: WalletState }

const address = '0x123address'
const chainId = ChainId.ETHEREUM_GOERLI
const providerType = ProviderType.INJECTED
const network = Network.ETHEREUM
const networks: Networks = {
  [Network.ETHEREUM]: {} as NetworkData,
  [Network.MATIC]: {} as NetworkData
}

describe('Wallet selectors', () => {
  beforeEach(() => {
    initialState = { wallet: INITIAL_STATE }
  })

  describe('when getting the wallet state', () => {
    it('should return the state', () => {
      expect(getState(initialState)).toEqual(initialState.wallet)
    })
  })

  describe('when getting the data state of the wallet', () => {
    it("should return the wallet state's data", () => {
      expect(getData(initialState)).toEqual(initialState.wallet.data)
    })
  })

  describe('when getting the error state of the wallet', () => {
    it("should return the wallet state's errors", () => {
      expect(getError(initialState)).toEqual(initialState.wallet.error)
    })
  })

  describe('when getting the loading state of the wallet', () => {
    it("should return the wallet's state loading data", () => {
      expect(getLoading(initialState)).toEqual(initialState.wallet.loading)
    })
  })

  describe('when getting if the user is connected', () => {
    describe('and state is empty', () => {
      it('should return false', () => {
        expect(isConnected(initialState)).toBe(false)
      })
    })

    describe('and state is not empty', () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          wallet: {
            ...initialState.wallet,
            data: {} as Wallet
          }
        }
      })

      it('should return true', () => {
        expect(isConnected(initialState)).toBe(true)
      })
    })
  })

  describe('when getting if the connect wallet request is on going', () => {
    describe('when it is on going', () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          wallet: {
            ...initialState.wallet,
            loading: [connectWalletRequest()]
          }
        }
      })

      it('should return true', () => {
        expect(isConnecting(initialState)).toBe(true)
      })
    })

    describe("when it isn't on going", () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          wallet: {
            ...initialState.wallet,
            loading: []
          }
        }
      })

      it('should return false', () => {
        expect(isConnecting(initialState)).toBe(false)
      })
    })
  })

  describe('when getting if the enable wallet request is on going', () => {
    let providerType: ProviderType

    describe('when it is on going', () => {
      beforeEach(() => {
        providerType = ProviderType.INJECTED
        initialState = {
          ...initialState,
          wallet: {
            ...initialState.wallet,
            loading: [enableWalletRequest(providerType)]
          }
        }
      })

      it('should return true', () => {
        expect(isEnabling(initialState)).toBe(true)
      })
    })

    describe("when it isn't on going", () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          wallet: {
            ...initialState.wallet,
            loading: []
          }
        }
      })

      it('should return false', () => {
        expect(isEnabling(initialState)).toBe(false)
      })
    })
  })

  describe.each([
    ['address', getAddress, address],
    ['chainId', getChainId, chainId],
    ['providerType', getProviderType, providerType],
    ['network', getNetwork, network],
    ['networks', getNetworks, networks]
  ])('when getting the %s', (description, selector, expected) => {
    describe('and the user is connected', () => {
      beforeEach(() => {
        initialState = {
          ...initialState,
          wallet: {
            ...initialState.wallet,
            data: {
              address,
              chainId,
              providerType,
              network,
              networks
            } as Wallet
          }
        }
      })

      it(`should take and return the ${description} from the wallet data`, () => {
        expect(selector(initialState)).toEqual(expected)
      })
    })

    describe('and the user is not connected', () => {
      it('should return undefined', () => {
        expect(getAddress(initialState)).toBeUndefined()
      })
    })
  })

  describe('when getting the app chain id state of the wallet', () => {
    it("should return the wallet state's app chain id", () => {
      expect(getAppChainId(initialState)).toEqual(
        initialState.wallet.appChainId
      )
    })
  })
})
