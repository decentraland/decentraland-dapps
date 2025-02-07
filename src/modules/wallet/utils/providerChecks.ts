import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { Wallet } from '../types'

export function isWeb2Wallet(wallet: Wallet): boolean {
  return (
    wallet.providerType === ProviderType.MAGIC ||
    wallet.providerType === ProviderType.MAGIC_TEST
  )
}
