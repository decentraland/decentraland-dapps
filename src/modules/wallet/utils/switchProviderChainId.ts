import { ProviderType } from '@dcl/schemas'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Provider, connection } from 'decentraland-connect'
import { getAddEthereumChainParameters } from './getAddEthereumChainParameters'
import { getProviderChainId } from './getProviderChainId'
import { JsonRPCInvalidResponseError } from './JsonRPCInvalidResponseError'

/**
 * Change the provider's chain to a provided chain.
 * In case it returns an error that the chain does not exist, it will try to add it.
 * @param provider - The provider used to swith the chain
 * @param chainId - The chain id that is being changed
 * @returns A number representing the chain id
 */

export async function switchProviderChainId(provider: Provider, chainId: ChainId) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + chainId.toString(16) }]
    })

    return chainId
  } catch (switchError) {
    const isMetamaskDesktopError = switchError?.code === 4902
    const isWalletConnectError =
      switchError?.code === 5000 && connection.getConnectionData()?.providerType === ProviderType.WALLET_CONNECT_V2
    // This error code indicates that the chain has not been added to MetaMask.
    if (provider && (isMetamaskDesktopError || isWalletConnectError)) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [getAddEthereumChainParameters(chainId)]
        })
        const newChainId = await getProviderChainId(provider)

        if (chainId !== newChainId) {
          throw new Error('chainId did not change after adding network')
        }
        return chainId
      } catch (addError) {
        throw new Error(`Error adding network: ${addError.message}`)
      }
    } // We're throwing specific error for this message because we don't know how to reproduce it and we don't want to get logged
    else if (switchError?.message === 'JSON RPC response format is invalid') {
      throw new JsonRPCInvalidResponseError(switchError?.message)
    }
    throw new Error(`Error switching network: ${switchError.message}`)
  }
}
