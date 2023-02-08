import { ethers } from 'ethers';
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id';
import { getNetworkProvider } from '../../../lib/eth';


export async function getTargetNetworkProvider(chainId: ChainId) {
  const networkProvider = await getNetworkProvider(chainId);
  return new ethers.providers.Web3Provider(networkProvider);
}
