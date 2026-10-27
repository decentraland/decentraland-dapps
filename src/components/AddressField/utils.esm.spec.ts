/**
 * @jest-environment node
 */

// The original global ENS patch failed when it tried redefining ethers' ESM
// export getters. Select that real module locally without changing other suites.
// SWC executes its ESM source in Jest while preserving nonconfigurable getters.
describe('when importing ENS helpers with ethers ESM exports', () => {
  let ethersModule: typeof import('ethers')

  beforeEach(() => {
    jest.resetModules()
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
  })

  afterEach(() => {
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
  })
})
