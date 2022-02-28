import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { LoginModalOptionType } from 'decentraland-ui/dist/components/LoginModal/LoginModal'
import {
  isCoinbaseProvider,
  isCucumberProvider,
  isDapperProvider
} from '../../lib/eth'

const {
  METAMASK,
  DAPPER,
  SAMSUNG,
  FORTMATIC,
  COINBASE,
  WALLET_CONNECT,
  WALLET_LINK
} = LoginModalOptionType

export function toModalOptionType(
  providerType: ProviderType
): LoginModalOptionType | undefined {
  switch (providerType) {
    case ProviderType.INJECTED:
      if (isCucumberProvider()) {
        return SAMSUNG
      } else if (isCoinbaseProvider()) {
        return COINBASE
      } else if (isDapperProvider()) {
        return DAPPER
      } else {
        return METAMASK
      }
    case ProviderType.FORTMATIC:
      return FORTMATIC
    case ProviderType.WALLET_CONNECT:
      return WALLET_CONNECT
    case ProviderType.WALLET_LINK:
      return WALLET_LINK
    default:
      console.warn(`Invalid provider type ${providerType}`)
      return
  }
}

export function toProviderType(
  modalOptionType: LoginModalOptionType
): ProviderType {
  switch (modalOptionType) {
    case METAMASK:
    case COINBASE:
    case DAPPER:
    case SAMSUNG:
      return ProviderType.INJECTED
    case FORTMATIC:
      return ProviderType.FORTMATIC
    case WALLET_CONNECT:
      return ProviderType.WALLET_CONNECT
    case WALLET_LINK:
      return ProviderType.WALLET_LINK
    default:
      throw new Error(`Invalid login type ${modalOptionType}`)
  }
}
