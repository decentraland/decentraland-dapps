import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { dnsEncode, namehash } from '@ethersproject/hash'
import { Web3Provider } from '@ethersproject/providers'
import type { TransactionRequest } from '@ethersproject/providers'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { getChainIdByNetwork, getNetworkWeb3Provider } from '../../lib/eth'
import { getAnalytics } from '../../modules/analytics/utils'
import { UNIVERSAL_RESOLVER_ADDRESS, resolveName } from './utils'

jest.mock('../../lib/eth')
jest.mock('../../modules/analytics/utils')

const mockGetChainIdByNetwork = getChainIdByNetwork as jest.MockedFunction<typeof getChainIdByNetwork>
const mockGetNetworkWeb3Provider = getNetworkWeb3Provider as jest.MockedFunction<typeof getNetworkWeb3Provider>
const mockGetAnalytics = getAnalytics as jest.MockedFunction<typeof getAnalytics>

const universalResolverInterface = new Interface([
  'function requireResolver(bytes name) view returns ((bytes name, uint256 offset, bytes32 node, address resolver, bool extended) info)',
  'error ResolverNotFound(bytes name)',
  'error ResolverNotContract(bytes name, address resolver)',
  'error ResolverError(bytes errorData)'
])
const resolverInterface = new Interface([
  'function addr(bytes32 node) view returns (address)',
  'function resolve(bytes name, bytes data) view returns (bytes)'
])

const name = 'someone.eth'
const resolverAddress = getAddress('0x00000000000000000000000000000000000000aa')
const currentAddress = getAddress('0x000000000000000000000000000000000000000b')

function encodeRequireResolverResult(extended: boolean) {
  return universalResolverInterface.encodeFunctionResult('requireResolver', [
    [dnsEncode(name), 0, namehash(name), resolverAddress, extended]
  ])
}

function encodeAddrResult(address: string) {
  return resolverInterface.encodeFunctionResult('addr', [address])
}

let call: jest.Mock<Promise<string>, [TransactionRequest]>
let track: jest.Mock

beforeEach(() => {
  call = jest.fn()
  track = jest.fn()
  mockGetChainIdByNetwork.mockReturnValue(ChainId.ETHEREUM_MAINNET)
  mockGetNetworkWeb3Provider.mockResolvedValue({ call } as unknown as Web3Provider)
  mockGetAnalytics.mockReturnValue({ track } as unknown as ReturnType<typeof getAnalytics>)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('when resolving a name', () => {
  it('should resolve it against the app Ethereum chain regardless of the connected network', async () => {
    mockGetChainIdByNetwork.mockReturnValue(ChainId.ETHEREUM_SEPOLIA)
    call.mockResolvedValueOnce(encodeRequireResolverResult(false)).mockResolvedValueOnce(encodeAddrResult(currentAddress))

    await resolveName(name)

    expect(mockGetChainIdByNetwork).toHaveBeenCalledWith(Network.ETHEREUM)
    expect(mockGetNetworkWeb3Provider).toHaveBeenCalledWith(ChainId.ETHEREUM_SEPOLIA)
  })

  it("should ask the Universal Resolver for the name's current resolver with the DNS-encoded name", async () => {
    call.mockResolvedValueOnce(encodeRequireResolverResult(false)).mockResolvedValueOnce(encodeAddrResult(currentAddress))

    await resolveName(name)

    expect(call).toHaveBeenNthCalledWith(1, {
      to: UNIVERSAL_RESOLVER_ADDRESS,
      data: universalResolverInterface.encodeFunctionData('requireResolver', [dnsEncode(name)])
    })
  })

  describe('and the current resolver is not an extended resolver', () => {
    beforeEach(() => {
      call.mockResolvedValueOnce(encodeRequireResolverResult(false))
    })

    it('should request the address from the current resolver with the namehash', async () => {
      call.mockResolvedValueOnce(encodeAddrResult(currentAddress))

      await resolveName(name)

      expect(call).toHaveBeenNthCalledWith(2, {
        to: resolverAddress,
        data: resolverInterface.encodeFunctionData('addr', [namehash(name)]),
        ccipReadEnabled: true
      })
    })

    it('should return the address set on the current resolver', async () => {
      call.mockResolvedValueOnce(encodeAddrResult(currentAddress))

      await expect(resolveName(name)).resolves.toBe(currentAddress)
    })

    it('should track the resolution', async () => {
      call.mockResolvedValueOnce(encodeAddrResult(currentAddress))

      await resolveName(name)

      expect(track).toHaveBeenCalledWith('Resolve Address from Name', { name, address: currentAddress })
    })

    describe('and the resolver has no address for the name', () => {
      beforeEach(() => {
        call.mockResolvedValueOnce(encodeAddrResult(AddressZero))
      })

      it('should return undefined', async () => {
        await expect(resolveName(name)).resolves.toBeUndefined()
      })

      it('should not track the resolution', async () => {
        await resolveName(name)

        expect(track).not.toHaveBeenCalled()
      })
    })

    describe('and the resolver returns no data', () => {
      it('should return undefined', async () => {
        call.mockResolvedValueOnce('0x')

        await expect(resolveName(name)).resolves.toBeUndefined()
      })
    })
  })

  describe('and the current resolver is an extended resolver', () => {
    beforeEach(() => {
      call.mockResolvedValueOnce(encodeRequireResolverResult(true))
    })

    it('should request the address through resolve() with the DNS-encoded name and CCIP-Read enabled', async () => {
      call.mockResolvedValueOnce(resolverInterface.encodeFunctionResult('resolve', [encodeAddrResult(currentAddress)]))

      await resolveName(name)

      expect(call).toHaveBeenNthCalledWith(2, {
        to: resolverAddress,
        data: resolverInterface.encodeFunctionData('resolve', [
          dnsEncode(name),
          resolverInterface.encodeFunctionData('addr', [namehash(name)])
        ]),
        ccipReadEnabled: true
      })
    })

    it('should return the address decoded from the resolve() result', async () => {
      call.mockResolvedValueOnce(resolverInterface.encodeFunctionResult('resolve', [encodeAddrResult(currentAddress)]))

      await expect(resolveName(name)).resolves.toBe(currentAddress)
    })

    it('should return undefined when the resolved address is the zero address', async () => {
      call.mockResolvedValueOnce(resolverInterface.encodeFunctionResult('resolve', [encodeAddrResult(AddressZero)]))

      await expect(resolveName(name)).resolves.toBeUndefined()
    })
  })

  describe('and the name has no resolver', () => {
    it('should return undefined without querying a resolver', async () => {
      call.mockResolvedValueOnce(universalResolverInterface.encodeErrorResult('ResolverNotFound', [dnsEncode(name)]))

      await expect(resolveName(name)).resolves.toBeUndefined()
      expect(call).toHaveBeenCalledTimes(1)
    })
  })

  describe('and the name resolver is not a contract', () => {
    it('should return undefined', async () => {
      call.mockResolvedValueOnce(universalResolverInterface.encodeErrorResult('ResolverNotContract', [dnsEncode(name), resolverAddress]))

      await expect(resolveName(name)).resolves.toBeUndefined()
    })
  })

  describe('and the Universal Resolver reverts with another error', () => {
    it('should throw instead of reporting the name as not found', async () => {
      call.mockResolvedValueOnce(universalResolverInterface.encodeErrorResult('ResolverError', ['0x']))

      await expect(resolveName(name)).rejects.toThrow()
    })
  })

  describe('and the RPC request fails', () => {
    it('should throw the RPC error', async () => {
      call.mockRejectedValueOnce(new Error('RPC unavailable'))

      await expect(resolveName(name)).rejects.toThrow('RPC unavailable')
    })
  })

  describe('and the offchain lookup fails', () => {
    it('should throw the lookup error', async () => {
      call.mockResolvedValueOnce(encodeRequireResolverResult(true)).mockRejectedValueOnce(new Error('CCIP gateway error'))

      await expect(resolveName(name)).rejects.toThrow('CCIP gateway error')
    })
  })
})
