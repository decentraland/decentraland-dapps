import type { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import type { connection as Connection, Provider } from 'decentraland-connect'
import type { getENSWeb3Provider as GetENSWeb3Provider } from './eth'

describe('when creating an ENS provider with a wallet already connected', () => {
  let connection: typeof Connection
  let getENSWeb3Provider: typeof GetENSWeb3Provider
  let cachedProviders: Web3Provider[]
  let networkProvider: Provider
  let walletProvider: Provider
  let createProvider: jest.SpyInstance
  let getProvider: jest.SpyInstance
  let tryPreviousConnection: jest.SpyInstance

  beforeEach(() => {
    jest.resetModules()
    connection = require('decentraland-connect').connection
    getENSWeb3Provider = require('./eth').getENSWeb3Provider
    networkProvider = { request: jest.fn() } as unknown as Provider
    walletProvider = { request: jest.fn() } as unknown as Provider
    createProvider = jest.spyOn(connection, 'createProvider').mockResolvedValue(networkProvider)
    getProvider = jest.spyOn(connection, 'getProvider').mockResolvedValue(walletProvider)
    tryPreviousConnection = jest.spyOn(connection, 'tryPreviousConnection').mockRejectedValue(new Error('Unexpected wallet restoration'))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it.each([ChainId.ETHEREUM_MAINNET, ChainId.ETHEREUM_SEPOLIA])(
    'should use an independent network provider on chain %s without consulting or restoring the wallet',
    async chainId => {
      await expect(getENSWeb3Provider(chainId)).resolves.toHaveProperty('provider', networkProvider)
      expect(createProvider).toHaveBeenCalledWith(ProviderType.NETWORK, chainId)
      expect(getProvider).not.toHaveBeenCalled()
      expect(tryPreviousConnection).not.toHaveBeenCalled()
      expect(walletProvider.request).not.toHaveBeenCalled()
    }
  )

  it('should share concurrent and subsequent lookups on the same chain', async () => {
    cachedProviders = await Promise.all([getENSWeb3Provider(ChainId.ETHEREUM_MAINNET), getENSWeb3Provider(ChainId.ETHEREUM_MAINNET)])
    expect(cachedProviders[0]).toBe(cachedProviders[1])
    await expect(getENSWeb3Provider(ChainId.ETHEREUM_MAINNET)).resolves.toBe(cachedProviders[0])
    expect(createProvider).toHaveBeenCalledTimes(1)
  })

  it('should keep providers isolated by chain', async () => {
    expect(await getENSWeb3Provider(ChainId.ETHEREUM_MAINNET)).not.toBe(await getENSWeb3Provider(ChainId.ETHEREUM_SEPOLIA))
    expect(createProvider).toHaveBeenCalledTimes(2)
  })

  describe('and creating a provider fails', () => {
    let error: Error

    beforeEach(() => {
      error = new Error('Provider unavailable')
      createProvider.mockRejectedValueOnce(error)
    })

    it('should preserve the error and retry instead of caching the failure', async () => {
      await expect(getENSWeb3Provider(ChainId.ETHEREUM_MAINNET)).rejects.toBe(error)
      await expect(getENSWeb3Provider(ChainId.ETHEREUM_MAINNET)).resolves.toHaveProperty('provider', networkProvider)
      expect(createProvider).toHaveBeenCalledTimes(2)
    })
  })
})
