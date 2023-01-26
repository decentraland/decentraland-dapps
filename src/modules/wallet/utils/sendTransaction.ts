import { ContractData, sendMetaTransaction } from "decentraland-transactions"
import { Contract, PopulatedTransaction } from '@ethersproject/contracts'
import { getConnectedProvider } from "../../../lib/eth"
import { getTargetNetworkProvider } from "./getTargetNetworkProvider"
import { transactionEvents } from "./transactionEvents"
import { TransactionEventData, TransactionEventType } from "./types"
import { getTransactionsApiUrl } from "./urls"
import { getProviderChainId } from "./getProviderChainId"

/**
 * Sends a transaction either as a meta transaction or as a regular transaction.
 * - If the contract chain id differs from the current provider chain id, a meta transaction will be sent.
 * - If the contract chain id is the same as the current provider chain id, a regular transaction will be sent.
 * @param contract - The contract to send the transaction to.
 * @param contractMethodName - The name of the contract method to call.
 * @param contractMethodArgs - The arguments to pass to the contract method.
 */
export async function sendTransaction(
  contract: ContractData,
  contractMethodName: string,
  ...contractArguments: any[]
): Promise<string>

/**
 * @deprecated
 * Sends a transaction either as a meta transaction or as a regular transaction.
 * - If the contract chain id differs from the current provider chain id, a meta transaction will be sent.
 * - If the contract chain id is the same as the current provider chain id, a regular transaction will be sent.
 * @param contract - The contract to send the transaction to.
 * @param getPopulatedTransaction - A function that returns a populated transaction.
 */
export async function sendTransaction(
  contract: ContractData,
  getPopulatedTransaction: (
    populateTransaction: Contract['populateTransaction']
  ) => Promise<PopulatedTransaction>
): Promise<string>

export async function sendTransaction(...args: any[]) {
  const [
    contract,
    contractMethodNameOrGetPopulatedTransaction,
    ...contractArguments
  ] = args as [ContractData, string | Function, any[]]

  try {
    const connectedProvider = await getConnectedProvider()
    if (!connectedProvider) {
      throw new Error('Provider not connected')
    }

    const chainId = await getProviderChainId(connectedProvider)

    const targetNetworkProvider = await getTargetNetworkProvider(
      contract.chainId
    )

    const contractInstance = new Contract(
      contract.address,
      contract.abi,
      targetNetworkProvider
    )

    // Populate the transaction data
    const unsignedTx = await (typeof contractMethodNameOrGetPopulatedTransaction ===
      'function'
      ? contractMethodNameOrGetPopulatedTransaction(
        contractInstance.populateTransaction
      )
      : contractInstance.populateTransaction[
        contractMethodNameOrGetPopulatedTransaction
      ](...contractArguments))

    // If the connected provider is in the target network, use it to sign and send the tx
    if (chainId === contract.chainId) {
      const signer = targetNetworkProvider.getSigner()
      const tx = await signer.sendTransaction(unsignedTx)
      transactionEvents.emit(TransactionEventType.SUCCESS, { txHash: tx.hash })
      return tx.hash
    } else {
      // otherwise, send it as a meta tx
      const txHash = await sendMetaTransaction(
        connectedProvider,
        targetNetworkProvider,
        unsignedTx.data!,
        contract,
        {
          serverURL: getTransactionsApiUrl()
        }
      )
      transactionEvents.emit(TransactionEventType.SUCCESS, { txHash })
      return txHash
    }
  } catch (error) {
    const data: TransactionEventData<TransactionEventType.ERROR> = {
      type: TransactionEventType.ERROR,
      error: error as Error
    }
    transactionEvents.emit(TransactionEventType.ERROR, data)
    throw error
  }
}