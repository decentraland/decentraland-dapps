import { getENSChainId, resolveAddress } from '../../lib/ens'
import { _getAppChainId, getNetworkWeb3Provider } from '../../lib/eth'
import { getAnalytics } from '../../modules/analytics/utils'

export { resolveAddress, UNIVERSAL_RESOLVER_ADDRESS } from '../../lib/ens'

export async function resolveName(name: string) {
  // ENS lives on Ethereum, so resolve against the app's Ethereum chain regardless of the network the wallet is connected to
  const chainId = _getAppChainId()
  if (chainId == null) {
    throw new Error('Could not get app chain id')
  }
  const provider = await getNetworkWeb3Provider(getENSChainId(chainId))
  const resolvedAddress = await resolveAddress(provider, name)
  if (resolvedAddress) {
    const analytics = getAnalytics()
    if (analytics) {
      analytics.track('Resolve Address from Name', {
        name,
        address: resolvedAddress
      })
    }

    return resolvedAddress
  }

  return undefined
}
