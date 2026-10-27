import { getENSChainId, isENSName, normalizeENSName, resolveAddress } from '../../lib/ens'
import { _getAppChainId, getENSWeb3Provider } from '../../lib/eth'
import { getAnalytics } from '../../modules/analytics/utils'

export { resolveAddress, UNIVERSAL_RESOLVER_ADDRESS } from '../../lib/ens'

export async function resolveName(input: string) {
  if (!isENSName(input)) return undefined
  const name = normalizeENSName(input)
  // ENS lives on Ethereum, so resolve against the app's Ethereum chain regardless of the network the wallet is connected to
  const chainId = _getAppChainId()
  if (chainId == null) {
    throw new Error('Could not get app chain id')
  }
  const provider = await getENSWeb3Provider(getENSChainId(chainId))
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
