import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { connection, Provider } from 'decentraland-connect'
import { getENSWeb3Provider } from './eth'

describe('when creating an ENS provider with a wallet already connected', () => {
  let networkProvider: Provider
  let walletProvider: Provider
  let createProvider: jest.SpyInstance
  let getProvider: jest.SpyInstance
  let tryPreviousConnection: jest.SpyInstance

  beforeEach(() => {
    networkProvider = { request: jest.fn() } as unknown as Provider
    walletProvider = { request: jest.fn() } as unknown as Provider
    createProvider = jest.spyOn(connection, 'createProvider').mockResolvedValue(networkProvider)
    getProvider = jest.spyOn(connection, 'getProvider').mockResolvedValue(walletProvider)
    tryPreviousConnection = jest.spyOn(connection, 'tryPreviousConnection')
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
})
