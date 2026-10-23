// Adds Universal Resolver (ENSv2) support to ethers v5's provider.resolveName()
import '@ensdomains/ethers-patch-v5'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { getChainIdByNetwork, getNetworkWeb3Provider } from '../../lib/eth'
import { getAnalytics } from '../../modules/analytics/utils'

export async function resolveName(name: string) {
  // ENS lives on Ethereum, so resolve against the app's Ethereum chain regardless of the network the wallet is connected to.
  // The provider resolves the name's current resolver instead of assuming a fixed one, which could return a stale address.
  const provider = await getNetworkWeb3Provider(getChainIdByNetwork(Network.ETHEREUM))
  const resolvedAddress = await provider.resolveName(name)
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
