import { BaseProvider, Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { getChainIdByNetwork, getNetworkWeb3Provider } from '../../lib/eth'
import { getAnalytics } from '../../modules/analytics/utils'
import { resolveName } from './utils'

jest.mock('../../lib/eth')
jest.mock('../../modules/analytics/utils')

const mockGetChainIdByNetwork = getChainIdByNetwork as jest.MockedFunction<typeof getChainIdByNetwork>
const mockGetNetworkWeb3Provider = getNetworkWeb3Provider as jest.MockedFunction<typeof getNetworkWeb3Provider>
const mockGetAnalytics = getAnalytics as jest.MockedFunction<typeof getAnalytics>

const name = 'someone.eth'
const currentAddress = '0x000000000000000000000000000000000000000b'

let provider: { resolveName: jest.Mock }
let track: jest.Mock

beforeEach(() => {
  provider = { resolveName: jest.fn() }
  track = jest.fn()
  mockGetChainIdByNetwork.mockReturnValue(ChainId.ETHEREUM_MAINNET)
  mockGetNetworkWeb3Provider.mockResolvedValue(provider as unknown as Web3Provider)
  mockGetAnalytics.mockReturnValue({ track } as unknown as ReturnType<typeof getAnalytics>)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('when loading the module', () => {
  it('should patch the ethers providers with Universal Resolver support', () => {
    expect(BaseProvider.prototype.getResolverOld).toBeDefined()
  })
})

describe('when resolving a name', () => {
  it('should resolve it against the app Ethereum chain regardless of the connected network', async () => {
    mockGetChainIdByNetwork.mockReturnValue(ChainId.ETHEREUM_SEPOLIA)
    provider.resolveName.mockResolvedValue(currentAddress)

    await resolveName(name)

    expect(mockGetChainIdByNetwork).toHaveBeenCalledWith(Network.ETHEREUM)
    expect(mockGetNetworkWeb3Provider).toHaveBeenCalledWith(ChainId.ETHEREUM_SEPOLIA)
  })

  it("should resolve it through the provider's ENS lookup instead of a fixed resolver", async () => {
    provider.resolveName.mockResolvedValue(currentAddress)

    await resolveName(name)

    expect(provider.resolveName).toHaveBeenCalledWith(name)
  })

  describe('and the name resolves to an address', () => {
    beforeEach(() => {
      provider.resolveName.mockResolvedValue(currentAddress)
    })

    it('should return the resolved address', async () => {
      await expect(resolveName(name)).resolves.toBe(currentAddress)
    })

    it('should track the resolution', async () => {
      await resolveName(name)

      expect(track).toHaveBeenCalledWith('Resolve Address from Name', { name, address: currentAddress })
    })
  })

  describe('and the name does not resolve to an address', () => {
    beforeEach(() => {
      provider.resolveName.mockResolvedValue(null)
    })

    it('should return undefined', async () => {
      await expect(resolveName(name)).resolves.toBeUndefined()
    })

    it('should not track the resolution', async () => {
      await resolveName(name)

      expect(track).not.toHaveBeenCalled()
    })
  })
})
