import { Provider } from 'decentraland-connect';
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id';
import { getProviderChainId } from './getProviderChainId';
import { getAddEthereumChainParameters } from "./getAddEthereumChainParameters";

/**
 * Change the provider's chain to a provided chain.
 * In case it returns an error that the chain does not exist, it will try to add it.
 * @param provider - The provider used to swith the chain
 * @param chainId - The chain id that is being changed
 * @returns A number representing the chain id
 */

export async function switchProviderChainId(
  provider: Provider,
  chainId: ChainId
) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + chainId.toString(16) }]
    });

    return chainId;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (provider && switchError?.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [getAddEthereumChainParameters(chainId)]
        });
        const newChainId = await getProviderChainId(provider);

        if (chainId !== newChainId) {
          throw new Error('chainId did not change after adding network');
        }
        return chainId;
      } catch (addError) {
        throw new Error(`Error adding network: ${addError.message}`);
      }
    }
    throw new Error(`Error switching network: ${switchError.message}`);
  }
}
