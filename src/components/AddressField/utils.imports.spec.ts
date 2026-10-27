/**
 * @jest-environment node
 */

// Exercise the helpers' ethers dependencies through their actual ESM source, plus
// the root ethers entry that exposed the original global-patch regression.
// SWC preserves nonconfigurable export getters. This checks import compatibility;
// it does not emulate a browser bundler's dependency resolution or tree shaking.
describe('when importing ENS helpers with ethers ESM exports', () => {
  let ethersModule: typeof import('ethers')
  let providersModule: typeof import('@ethersproject/providers')
  let hashModule: typeof import('@ethersproject/hash')

  beforeEach(() => {
    jest.resetModules()
    jest.doMock('@ethersproject/abi', () => jest.requireActual('@ethersproject/abi/lib.esm/index.js'))
    jest.doMock('@ethersproject/address', () => jest.requireActual('@ethersproject/address/lib.esm/index.js'))
    jest.doMock('@ethersproject/bytes', () => jest.requireActual('@ethersproject/bytes/lib.esm/index.js'))
    jest.doMock('@ethersproject/constants', () => jest.requireActual('@ethersproject/constants/lib.esm/index.js'))
    jest.doMock('@ethersproject/hash', () => jest.requireActual('@ethersproject/hash/lib.esm/index.js'))
    jest.doMock('@ethersproject/keccak256', () => jest.requireActual('@ethersproject/keccak256/lib.esm/index.js'))
    jest.doMock('@ethersproject/providers', () => jest.requireActual('@ethersproject/providers/lib.esm/index.js'))
    jest.doMock('@ethersproject/strings', () => jest.requireActual('@ethersproject/strings/lib.esm/index.js'))
    jest.doMock('ethers', () => jest.requireActual('ethers/lib.esm/index.js'))
    jest.doMock('../../lib/eth', () => ({
      _getAppChainId: jest.fn().mockReturnValue(1),
      getENSWeb3Provider: jest.fn()
    }))
    jest.doMock('../../modules/analytics/utils', () => ({ getAnalytics: jest.fn() }))
    jest.doMock('react', () => {
      throw new Error('ENS helpers must load independently of React')
    })
    ethersModule = require('ethers')
    providersModule = require('@ethersproject/providers')
    hashModule = require('@ethersproject/hash')
  })

  afterEach(() => {
    jest.dontMock('@ethersproject/abi')
    jest.dontMock('@ethersproject/address')
    jest.dontMock('@ethersproject/bytes')
    jest.dontMock('@ethersproject/constants')
    jest.dontMock('@ethersproject/hash')
    jest.dontMock('@ethersproject/keccak256')
    jest.dontMock('@ethersproject/providers')
    jest.dontMock('@ethersproject/strings')
    jest.dontMock('ethers')
    jest.dontMock('../../lib/eth')
    jest.dontMock('../../modules/analytics/utils')
    jest.dontMock('react')
    jest.resetModules()
  })

  it('should exercise the nonconfigurable export that the original patch tried to redefine', () => {
    expect(Object.getOwnPropertyDescriptor(ethersModule.utils, 'dnsEncode')).toMatchObject({
      configurable: false,
      get: expect.any(Function)
    })
  })

  it('should preserve the real providers and hash ESM export getters', () => {
    expect(Object.getOwnPropertyDescriptor(providersModule, 'JsonRpcProvider')).toMatchObject({
      configurable: false,
      get: expect.any(Function)
    })
    expect(Object.getOwnPropertyDescriptor(hashModule, 'namehash')).toMatchObject({
      configurable: false,
      get: expect.any(Function)
    })
  })

  describe('and the address-field resolver is loaded', () => {
    let addressUtils: typeof import('./utils')

    beforeEach(() => {
      addressUtils = require('./utils')
    })

    it('should initialize without modifying the ethers exports', () => {
      expect(typeof addressUtils.resolveName).toBe('function')
    })
  })

  describe('and the public ENS module is loaded', () => {
    let ens: typeof import('../../lib/ens')

    beforeEach(() => {
      ens = require('../../lib/ens')
    })

    it('should expose address, contenthash and encoding helpers independently of React', () => {
      expect(typeof ens.resolveAddress).toBe('function')
      expect(typeof ens.resolveContenthash).toBe('function')
      expect(typeof ens.encodeENSName).toBe('function')
    })

    describe('and an address record is resolved', () => {
      let provider: { call: jest.Mock }
      let recipient: string
      let resolver: string
      let recordCalldata: string

      beforeEach(() => {
        recipient = '0x0000000000000000000000000000000000000011'
        resolver = '0x0000000000000000000000000000000000000022'
        const { Interface } = require('@ethersproject/abi') as typeof import('@ethersproject/abi')
        const registry = new Interface([
          'function requireResolver(bytes name) view returns ((bytes name, uint256 offset, bytes32 node, address resolver, bool extended) info)'
        ])
        const records = new Interface(['function addr(bytes32 node) view returns (address)'])
        recordCalldata = records.encodeFunctionData('addr', ['0x0b186ec5f7dc9a37a16b2b106ace014ec3bc95448b26f292be904c08b57e8374'])
        provider = {
          call: jest
            .fn()
            .mockResolvedValueOnce(
              registry.encodeFunctionResult('requireResolver', [
                ['0x046e616d650364636c0365746800', 0, '0x0b186ec5f7dc9a37a16b2b106ace014ec3bc95448b26f292be904c08b57e8374', resolver, false]
              ])
            )
            .mockResolvedValueOnce(records.encodeFunctionResult('addr', [recipient]))
        }
      })

      it('should normalize, encode and decode a resolution using the ESM dependencies', async () => {
        await expect(ens.resolveAddress(provider, 'NaMe.DCL.eth')).resolves.toBe(recipient)
        expect(provider.call).toHaveBeenCalledTimes(2)
        expect(provider.call).toHaveBeenLastCalledWith({ to: resolver, data: recordCalldata, ccipReadEnabled: true })
      })
    })
  })
})
