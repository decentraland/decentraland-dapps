import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { getENSChainId, isENSName, resolveAddress } from '../../lib/ens'
import { getNetworkWeb3Provider } from '../../lib/eth'

export const isENSAddress = isENSName

export const resolveENSname = async (name: string, chainId: ChainId) => {
  const ethereumChainId = getENSChainId(chainId)
  const provider = await getNetworkWeb3Provider(ethereumChainId)
  return (await resolveAddress(provider, name)) ?? null
}
