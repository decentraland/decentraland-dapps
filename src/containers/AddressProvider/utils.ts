import { Web3Provider } from '@ethersproject/providers/lib/web3-provider'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { getNetworkProvider } from '../../lib/eth'

export const isENSAddress = (address: string) => {
  return address.includes('.eth')
}

export const resolveENSname = async (name: string, chainId: ChainId) => {
  const connectedProvider = await getNetworkProvider(chainId)
  const ethersProvider = new Web3Provider(connectedProvider)
  return await ethersProvider.resolveName(name)
}
