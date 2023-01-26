import type { Provider } from 'decentraland-connect/dist/types';

/**
 * Obtains the chain id through a provider.
 * Different providers might return the chain id as a hex or a number.
 * This function abtracts the logic in order to always obtain the chain id as a number from any given provider.
 * @param provider - The provider used to obtain the chain id
 * @returns A number representing the chain id, Eg: 80001 for Mumbai, 137 for Matic Mainnet
 */

export async function getProviderChainId(provider: Provider): Promise<number> {
  const providerChainId = (await provider.request({
    method: 'eth_chainId',
    params: []
  })) as string | number;

  let chainId: number;

  if (typeof providerChainId === 'string') {
    chainId = parseInt(providerChainId as string, 16);
  } else {
    chainId = providerChainId;
  }

  return chainId;
}
