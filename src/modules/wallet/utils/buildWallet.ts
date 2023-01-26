import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id';
import {
  getConnectedProvider,
  getConnectedProviderType
} from '../../../lib/eth';
import { getChainConfiguration } from '../../../lib/chainConfiguration';
import { Networks, Wallet } from '../types';
import { fetchManaBalance } from './fetchManaBalance';


export async function buildWallet(appChainId: ChainId): Promise<Wallet> {
  const provider = await getConnectedProvider();

  if (!provider) {
    // This could happen if metamask is not installed
    throw new Error('Could not connect to Ethereum');
  }

  const eth = new Web3Provider(provider);

  const accounts: string[] = await eth.listAccounts();
  if (accounts.length === 0) {
    // This could happen if metamask was not enabled
    throw new Error('Could not get address');
  }

  const address = accounts[0].toString();
  const { chainId } = await eth.getNetwork();
  const chainConfig = getChainConfiguration(chainId);
  const appChainConfig = getChainConfiguration(appChainId);
  const networks: Partial<Networks> = {};

  for (const network of Object.keys(appChainConfig.networkMapping)) {
    const networkChainId = appChainConfig.networkMapping[network];
    networks[network] = {
      chainId: networkChainId,
      mana: await fetchManaBalance(networkChainId, address)
    };
  }

  return {
    address: address.toLowerCase(),
    providerType: getConnectedProviderType()!,
    networks: networks as Networks,
    network: chainConfig.network,
    chainId
  };
}
