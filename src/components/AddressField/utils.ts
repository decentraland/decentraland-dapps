import { Interface } from '@ethersproject/abi'
import { hexDataLength } from '@ethersproject/bytes'
import { AddressZero } from '@ethersproject/constants'
import { dnsEncode, namehash } from '@ethersproject/hash'
import type { Provider } from '@ethersproject/providers'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { getChainIdByNetwork, getNetworkWeb3Provider } from '../../lib/eth'
import { getAnalytics } from '../../modules/analytics/utils'

// ENS Universal Resolver proxy, deployed at the same address on Ethereum mainnet and Sepolia
export const UNIVERSAL_RESOLVER_ADDRESS = '0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe'

const universalResolverInterface = new Interface([
  'function requireResolver(bytes name) view returns ((bytes name, uint256 offset, bytes32 node, address resolver, bool extended) info)',
  'error ResolverNotFound(bytes name)',
  'error ResolverNotContract(bytes name, address resolver)'
])

const resolverInterface = new Interface([
  'function addr(bytes32 node) view returns (address)',
  'function resolve(bytes name, bytes data) view returns (bytes)'
])

// Universal Resolver errors that mean the name has no resolver, as opposed to a failure while resolving it
const NAME_WITHOUT_RESOLVER_ERRORS = ['ResolverNotFound', 'ResolverNotContract']

function isNameWithoutResolver(result: string) {
  try {
    return NAME_WITHOUT_RESOLVER_ERRORS.includes(universalResolverInterface.parseError(result).name)
  } catch {
    return false
  }
}

/**
 * Resolves the ETH address of an ENS name through the name's current resolver, found by the Universal Resolver.
 * Offchain (CCIP-Read) resolvers are supported. Returns undefined when the name has no resolver or no address,
 * and throws when the lookup itself fails, so an RPC or gateway error is not mistaken for a missing name.
 */
export async function resolveAddress(provider: Provider, name: string): Promise<string | undefined> {
  const dnsEncodedName = dnsEncode(name)
  const requireResolverResult = await provider.call({
    to: UNIVERSAL_RESOLVER_ADDRESS,
    data: universalResolverInterface.encodeFunctionData('requireResolver', [dnsEncodedName])
  })
  if (isNameWithoutResolver(requireResolverResult)) {
    return undefined
  }

  const [{ resolver, extended }] = universalResolverInterface.decodeFunctionResult('requireResolver', requireResolverResult)
  const addrData = resolverInterface.encodeFunctionData('addr', [namehash(name)])

  let addrResult: string
  if (extended) {
    // ENSIP-10 wildcard or offchain resolver: the address is requested through resolve(), which may use CCIP-Read
    const resolveResult = await provider.call({
      to: resolver,
      data: resolverInterface.encodeFunctionData('resolve', [dnsEncodedName, addrData]),
      ccipReadEnabled: true
    })
    ;[addrResult] = resolverInterface.decodeFunctionResult('resolve', resolveResult)
  } else {
    addrResult = await provider.call({ to: resolver, data: addrData })
  }

  if (hexDataLength(addrResult) === 0) {
    return undefined
  }

  const [address]: [string] = resolverInterface.decodeFunctionResult('addr', addrResult) as unknown as [string]
  return address === AddressZero ? undefined : address
}

export async function resolveName(name: string) {
  // ENS lives on Ethereum, so resolve against the app's Ethereum chain regardless of the network the wallet is connected to
  const provider = await getNetworkWeb3Provider(getChainIdByNetwork(Network.ETHEREUM))
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
