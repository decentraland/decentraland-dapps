import { ens_normalize } from '@adraffy/ens-normalize'
import { Interface } from '@ethersproject/abi'
import { concat, hexDataLength, hexlify } from '@ethersproject/bytes'
import { AddressZero } from '@ethersproject/constants'
import { keccak256 } from '@ethersproject/keccak256'
import type { Provider } from '@ethersproject/providers'
import { toUtf8Bytes } from '@ethersproject/strings'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'

// ENS entry points exist on Ethereum, even when the app operates on Polygon.
export function getENSChainId(chainId: ChainId): ChainId {
  return chainId === ChainId.ETHEREUM_SEPOLIA || chainId === ChainId.MATIC_AMOY ? ChainId.ETHEREUM_SEPOLIA : ChainId.ETHEREUM_MAINNET
}

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

/** Normalize once so discovery and record lookup always refer to the same ENSIP-15 name. */
export function encodeENSName(name: string) {
  const normalized = ens_normalize(name)
  const labels = normalized ? normalized.split('.').map(label => toUtf8Bytes(label)) : []
  let node = '0x' + '00'.repeat(32)
  for (const label of [...labels].reverse()) {
    node = keccak256(concat([node, keccak256(label)]))
  }
  const encodedLabels = labels.map(label => {
    if (label.length > 255) {
      throw new Error('ENS label exceeds 255 UTF-8 bytes')
    }
    return concat([new Uint8Array([label.length]), label])
  })
  return { dnsName: hexlify(concat([...encodedLabels, new Uint8Array([0])])), node }
}

export function isENSName(name: string): boolean {
  try {
    return ens_normalize(name).includes('.')
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
  const { dnsName: dnsEncodedName, node } = encodeENSName(name)
  const requireResolverResult = await provider.call({
    to: UNIVERSAL_RESOLVER_ADDRESS,
    data: universalResolverInterface.encodeFunctionData('requireResolver', [dnsEncodedName])
  })
  if (isNameWithoutResolver(requireResolverResult)) {
    return undefined
  }

  const [{ resolver, extended }] = universalResolverInterface.decodeFunctionResult('requireResolver', requireResolverResult)
  const addrData = resolverInterface.encodeFunctionData('addr', [node])

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
    addrResult = await provider.call({ to: resolver, data: addrData, ccipReadEnabled: true })
  }

  if (hexDataLength(addrResult) === 0) {
    return undefined
  }

  const [address]: [string] = resolverInterface.decodeFunctionResult('addr', addrResult) as unknown as [string]
  return address === AddressZero ? undefined : address
}
