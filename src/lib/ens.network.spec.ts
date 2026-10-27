import { Interface } from '@ethersproject/abi'
import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { getENSWeb3Provider } from './eth'
import { encodeENSName, resolveAddress, UNIVERSAL_RESOLVER_ADDRESS } from './ens'

describe('when the real NETWORK connector receives a JSON-RPC OffchainLookup error over HTTP', () => {
  let provider: Web3Provider
  let gateway: jest.SpyInstance
  let resolverInterface: Interface
  let universalInterface: Interface
  let offchainInterface: Interface
  let resolver: string
  let recipient: string
  let fetchMock: jest.SpyInstance

  beforeEach(async () => {
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
    const request = async (method: string, params: { to: string; data: string }[]) => {
      if (method === 'eth_chainId') return '0x1'
      if (method !== 'eth_call') throw new Error('Unexpected RPC method')
      if (params[0].to.toLowerCase() === UNIVERSAL_RESOLVER_ADDRESS.toLowerCase()) {
        const { dnsName, node } = encodeENSName('alice.eth')
        return universalInterface.encodeFunctionResult('requireResolver', [[dnsName, 0, node, resolver, true]])
      }
      if (params[0].data.startsWith('0x12345678')) {
        const addrResult = resolverInterface.encodeFunctionResult('addr', [recipient])
        return resolverInterface.encodeFunctionResult('resolve', [addrResult])
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
      throw offchainError
    }
    fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async (_url, options) => {
      const { method, params, id } = JSON.parse(options?.body as string)
      let payload
      try {
        payload = { jsonrpc: '2.0', id, result: await request(method, params) }
      } catch (error) {
        payload = { jsonrpc: '2.0', id, error: { code: -32000, message: 'execution reverted', data: (error as { data: string }).data } }
      }
      return { ok: true, json: async () => payload } as Response
    })
    provider = await getENSWeb3Provider(ChainId.ETHEREUM_MAINNET)
    gateway = jest.spyOn(provider, 'ccipReadFetch').mockResolvedValueOnce('0x12')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should complete the gateway callback and return the address', async () => {
    await expect(resolveAddress(provider, 'alice.eth')).resolves.toBe(recipient)
    expect(gateway).toHaveBeenCalledTimes(1)
  })

  describe('and the RPC returns an HTTP error', () => {
    beforeEach(() => {
      fetchMock.mockResolvedValue({ ok: false, status: 503, statusText: 'Service Unavailable' } as Response)
    })

    it('should fail closed without following a CCIP callback', async () => {
      await expect(resolveAddress(provider, 'alice.eth')).rejects.toMatchObject({
        code: 'CALL_EXCEPTION',
        error: { message: '503: Service Unavailable' }
      })
      expect(gateway).not.toHaveBeenCalled()
    })
  })
})
