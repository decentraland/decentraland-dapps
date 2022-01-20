import { ethers } from 'ethers'
import { ChainId } from '@dcl/schemas'
import { getNetworkProvider } from '../../lib/eth'

export const isENSAddress = (address: string) => {
  return address.includes('.eth')
}

export const resolveENSname = async (name: string, chainId: ChainId) => {
  const connectedProvider = await getNetworkProvider(chainId)
  const ethersProvider = new ethers.providers.Web3Provider(connectedProvider)
  return await ethersProvider.resolveName(name)
}
