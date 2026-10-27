import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { getENSChainId, isENSName, resolveAddress } from '../../lib/ens'
import { getENSWeb3Provider } from '../../lib/eth'

// Account URLs may use DNS-imported ENS names as well as .eth, so do not restrict TLDs.
export const isENSAddress = isENSName

export const resolveENSname = async (name: string, chainId: ChainId) => {
  const ethereumChainId = getENSChainId(chainId)
  const provider = await getENSWeb3Provider(ethereumChainId)
  return (await resolveAddress(provider, name)) ?? null
}
