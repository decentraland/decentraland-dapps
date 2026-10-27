import { Interface } from '@ethersproject/abi'
import { namehash } from '@ethersproject/hash'
import { Web3Provider } from '@ethersproject/providers'
import { encodeENSName, isENSName, resolveAddress, UNIVERSAL_RESOLVER_ADDRESS } from './ens'

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

describe('when a non-extended resolver uses CCIP Read', () => {
  let provider: Web3Provider
  let gateway: jest.SpyInstance
  let resolverInterface: Interface
  let universalInterface: Interface
  let offchainInterface: Interface
  let resolver: string
  let recipient: string

  beforeEach(() => {
    resolver = '0x00000000000000000000000000000000000000aa'
    recipient = '0x000000000000000000000000000000000000000b'
    resolverInterface = new Interface(['function addr(bytes32 node) view returns (address)'])
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
          return universalInterface.encodeFunctionResult('requireResolver', [[dnsName, 0, node, resolver, false]])
        }
        if (params[0].data.startsWith('0x12345678')) return resolverInterface.encodeFunctionResult('addr', [recipient])
        throw Object.assign(new Error('execution reverted'), {
          data: offchainInterface.encodeErrorResult('OffchainLookup', [
            resolver,
            ['https://example.invalid/{data}'],
            '0x12',
            '0x12345678',
            '0x'
          ])
        })
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
})
