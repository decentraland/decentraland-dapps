import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { Wallet } from '../types'
import { isWeb2Wallet } from './providerChecks'

let wallet: Wallet

describe('when checking if a wallet is a Web2 wallet', () => {
  describe('and the wallet is using MAGIC provider', () => {
    beforeEach(() => {
      wallet = {
        providerType: ProviderType.MAGIC
      } as Wallet
    })

    it('should return true', () => {
      expect(isWeb2Wallet(wallet)).toBe(true)
    })
  })

  describe('and the wallet is using MAGIC_TEST provider', () => {
    beforeEach(() => {
      wallet = {
        providerType: ProviderType.MAGIC_TEST
      } as Wallet
    })

    it('should return true', () => {
      expect(isWeb2Wallet(wallet)).toBe(true)
    })
  })

  describe.each([
    [ProviderType.INJECTED, 'INJECTED'],
    [ProviderType.NETWORK, 'NETWORK'],
    [ProviderType.WALLET_CONNECT, 'WALLET_CONNECT'],
    [ProviderType.WALLET_LINK, 'WALLET_LINK']
  ])('and the wallet is using %s provider', (providerType, providerName) => {
    beforeEach(() => {
      wallet = {
        providerType
      } as Wallet
    })

    it(`should return false for ${providerName} provider`, () => {
      expect(isWeb2Wallet(wallet)).toBe(false)
    })
  })
})
