import { ens_normalize } from '@adraffy/ens-normalize'
import { Interface } from '@ethersproject/abi'
import { concat, hexDataLength, hexlify } from '@ethersproject/bytes'
import { AddressZero } from '@ethersproject/constants'
import { keccak256 } from '@ethersproject/keccak256'
import type { Provider } from '@ethersproject/providers'
import { toUtf8Bytes } from '@ethersproject/strings'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'

/** A caller supplied ethers-compatible transport; call must implement CCIP-Read when enabled. */
export type ENSProvider = Pick<Provider, 'call'>

// ENS entry points exist on Ethereum, even when the app operates on Polygon.
export function getENSChainId(chainId: ChainId): ChainId {
  switch (chainId) {
    case ChainId.ETHEREUM_SEPOLIA:
    case ChainId.MATIC_AMOY:
      return ChainId.ETHEREUM_SEPOLIA
    case ChainId.ETHEREUM_MAINNET:
    case ChainId.MATIC_MAINNET:
    case ChainId.OPTIMISM_MAINNET:
    case ChainId.ARBITRUM_MAINNET:
    case ChainId.FANTOM_MAINNET:
    case ChainId.AVALANCHE_MAINNET:
    case ChainId.BSC_MAINNET:
      return ChainId.ETHEREUM_MAINNET
    default:
      throw new Error(`Unsupported ENS chain: ${chainId}`)
  }
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
  'function contenthash(bytes32 node) view returns (bytes)',
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

/** Trim pasted whitespace, then apply ENSIP-15 consistently for classification and resolution. */
export function normalizeENSName(name: string): string {
  return ens_normalize(name.trim())
}

/** Normalize once so discovery and record lookup always refer to the same ENSIP-15 name. */
export function encodeENSName(name: string) {
  const normalized = normalizeENSName(name)
  const labels = normalized ? normalized.split('.').map(label => toUtf8Bytes(label)) : []
  let node = '0x' + '00'.repeat(32)
  for (const label of [...labels].reverse()) {
    node = keccak256(concat([node, keccak256(label)]))
  }
  const encodedLabels = labels.map(label => {
    // The canonical Universal Resolver hashes bracketed labelhashes as literal labels;
    // substituting one here would discover a different node from the namehash above.
    if (label.length > 255) {
      throw new Error('ENS label exceeds 255 UTF-8 bytes')
    }
    return concat([new Uint8Array([label.length]), label])
  })
  return { name: normalized, dnsName: hexlify(concat([...encodedLabels, new Uint8Array([0])])), node }
}

export function isENSName(name: string): boolean {
  try {
    return normalizeENSName(name).includes('.')
  } catch {
    return false
  }
}

async function resolveRecord(provider: ENSProvider, name: string, record: 'addr' | 'contenthash'): Promise<string | undefined> {
  const { dnsName: dnsEncodedName, node } = encodeENSName(name)
  const requireResolverResult = await provider.call({
    to: UNIVERSAL_RESOLVER_ADDRESS,
    data: universalResolverInterface.encodeFunctionData('requireResolver', [dnsEncodedName])
  })
  if (isNameWithoutResolver(requireResolverResult)) {
    return undefined
  }

  const [{ resolver, extended }] = universalResolverInterface.decodeFunctionResult('requireResolver', requireResolverResult)
  const recordData = resolverInterface.encodeFunctionData(record, [node])

  let recordResult: string
  if (extended) {
    // ENSIP-10 wildcard or offchain resolver: the record is requested through resolve(), which may use CCIP-Read
    const resolveResult = await provider.call({
      to: resolver,
      data: resolverInterface.encodeFunctionData('resolve', [dnsEncodedName, recordData]),
      ccipReadEnabled: true
    })
    ;[recordResult] = resolverInterface.decodeFunctionResult('resolve', resolveResult)
  } else {
    recordResult = await provider.call({ to: resolver, data: recordData, ccipReadEnabled: true })
  }

  if (hexDataLength(recordResult) === 0) {
    return undefined
  }

  const value = resolverInterface.decodeFunctionResult(record, recordResult)[0] as string
  return value === '0x' || (record === 'addr' && value === AddressZero) ? undefined : value
}

/** Resolve the ETH address using the current resolver, including wildcard and CCIP-Read records.
 * Missing resolvers/records return undefined. Ethers also exposes explicit empty-data
 * reverts as empty results; errors without revert data and gateway failures propagate.
 */
export function resolveAddress(provider: ENSProvider, name: string): Promise<string | undefined> {
  return resolveRecord(provider, name, 'addr')
}

/** Resolve raw contenthash bytes; callers interpret application-specific content formats.
 * Missing resolvers/records return undefined. Ethers also exposes explicit empty-data
 * reverts as empty results; errors without revert data and gateway failures propagate.
 * An unsupported contenthash() function may produce either empty result or an error,
 * depending on whether the RPC includes empty revert data; callers must handle both.
 */
export function resolveContenthash(provider: ENSProvider, name: string): Promise<string | undefined> {
  return resolveRecord(provider, name, 'contenthash')
}
