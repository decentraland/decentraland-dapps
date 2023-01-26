import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id';
import { getNetworkProvider } from '../../../lib/eth';

export async function getTargetNetworkProvider(chainId: ChainId) {
  const networkProvider = await getNetworkProvider(chainId);
  return new Web3Provider(networkProvider);
}
