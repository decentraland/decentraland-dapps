import { Interface } from '@ethersproject/abi'
import { namehash } from '@ethersproject/hash'
import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { encodeENSName, getENSChainId, isENSName, resolveAddress, UNIVERSAL_RESOLVER_ADDRESS } from './ens'

describe('when encoding ENS names', () => {
  it('should encode a label longer than the legacy DNS limit', () => {
    expect(encodeENSName('a'.repeat(64) + '.eth').dnsName).toBe('0x40' + '61'.repeat(64) + '0365746800')
  })

  it('should accept a 255 byte label', () => {
    expect(encodeENSName('a'.repeat(255) + '.eth').dnsName).toBe('0xff' + '61'.repeat(255) + '0365746800')
  })

  it('should reject a label that cannot fit its length byte', () => {
    expect(() => encodeENSName('a'.repeat(256) + '.eth')).toThrow('255')
  })

  it('should normalize case before encoding and hashing', () => {
    expect(encodeENSName('ALICE.ETH')).toEqual({ dnsName: '0x05616c6963650365746800', node: namehash('alice.eth') })
  })

  it('should normalize emoji variation selectors consistently', () => {
    expect(encodeENSName('☕️.eth')).toEqual(encodeENSName('☕.eth'))
  })

  it('should recognize DNS names and subdomains', () => {
    expect(isENSName('alice.example.com')).toBe(true)
  })

  it('should reject malformed names', () => {
    expect(isENSName('alice..eth')).toBe(false)
  })
})

describe.each([
  { resolverType: 'standard', errorFormat: 'direct' },
  { resolverType: 'standard', errorFormat: 'nested' },
  { resolverType: 'extended', errorFormat: 'direct' },
  { resolverType: 'extended', errorFormat: 'nested' }
])('when a $resolverType resolver uses CCIP Read with a $errorFormat RPC error', ({ resolverType, errorFormat }) => {
  let provider: Web3Provider
  let gateway: jest.SpyInstance
  let resolverInterface: Interface
  let universalInterface: Interface
  let offchainInterface: Interface
  let resolver: string
  let recipient: string
  let extended: boolean

  beforeEach(() => {
    extended = resolverType === 'extended'
    resolver = '0x00000000000000000000000000000000000000aa'
    recipient = '0x000000000000000000000000000000000000000b'
    resolverInterface = new Interface([
      'function addr(bytes32 node) view returns (address)',
      'function resolve(bytes name, bytes data) view returns (bytes)'
    ])
    universalInterface = new Interface([
      'function requireResolver(bytes name) view returns ((bytes name,uint256 offset,bytes32 node,address resolver,bool extended) info)'
    ])
    offchainInterface = new Interface([
      'error OffchainLookup(address sender,string[] urls,bytes callData,bytes4 callbackFunction,bytes extraData)'
    ])
    provider = new Web3Provider({
      request: async ({ method, params }) => {
        if (method === 'eth_chainId') return '0x1'
        if (method !== 'eth_call') throw new Error('Unexpected RPC method')
        if (params[0].to.toLowerCase() === UNIVERSAL_RESOLVER_ADDRESS.toLowerCase()) {
          const { dnsName, node } = encodeENSName('alice.eth')
          return universalInterface.encodeFunctionResult('requireResolver', [[dnsName, 0, node, resolver, extended]])
        }
        if (params[0].data.startsWith('0x12345678')) {
          const addrResult = resolverInterface.encodeFunctionResult('addr', [recipient])
          return extended ? resolverInterface.encodeFunctionResult('resolve', [addrResult]) : addrResult
        }
        const offchainError = Object.assign(new Error('execution reverted'), {
          data: offchainInterface.encodeErrorResult('OffchainLookup', [
            resolver,
            ['https://example.invalid/{data}'],
            '0x12',
            '0x12345678',
            '0x'
          ])
        })
        throw errorFormat === 'nested' ? Object.assign(new Error('Internal JSON-RPC error'), { error: offchainError }) : offchainError
      }
    })
    gateway = jest.spyOn(provider, 'ccipReadFetch').mockResolvedValueOnce('0x12')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should complete the gateway callback and return the address', async () => {
    await expect(resolveAddress(provider, 'alice.eth')).resolves.toBe(recipient)
    expect(gateway).toHaveBeenCalledTimes(1)
  })

  describe('and the gateway fails', () => {
    let gatewayError: Error & { code: string }

    beforeEach(() => {
      // ethers ccipReadFetch reports HTTP/gateway failures as SERVER_ERROR, which _call preserves.
      gatewayError = Object.assign(new Error('Gateway unavailable'), { code: 'SERVER_ERROR' })
      gateway.mockReset().mockRejectedValueOnce(gatewayError)
    })

    it('should propagate the original gateway error', async () => {
      await expect(resolveAddress(provider, 'alice.eth')).rejects.toBe(gatewayError)
      expect(gateway).toHaveBeenCalledTimes(1)
    })
  })
})

describe('when choosing the ENS chain', () => {
  it.each([
    ChainId.ETHEREUM_MAINNET,
    ChainId.MATIC_MAINNET,
    ChainId.OPTIMISM_MAINNET,
    ChainId.ARBITRUM_MAINNET,
    ChainId.FANTOM_MAINNET,
    ChainId.AVALANCHE_MAINNET,
    ChainId.BSC_MAINNET
  ])('should map supported production chain %s to mainnet', chainId => {
    expect(getENSChainId(chainId)).toBe(ChainId.ETHEREUM_MAINNET)
  })

  it.each([ChainId.ETHEREUM_SEPOLIA, ChainId.MATIC_AMOY])('should map supported test chain %s to Sepolia', chainId => {
    expect(getENSChainId(chainId)).toBe(ChainId.ETHEREUM_SEPOLIA)
  })

  it.each([ChainId.ETHEREUM_GOERLI, ChainId.MATIC_MUMBAI, 999999, undefined])('should reject unsupported chain %s', chainId => {
    // Include untyped consumers of the published JavaScript package.
    expect(() => getENSChainId(chainId as ChainId)).toThrow('Unsupported ENS chain')
  })
})
