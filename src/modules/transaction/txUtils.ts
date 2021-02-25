import { Eth } from 'web3x-es/eth'
import { TransactionResponse } from 'web3x-es/formatters'
import { LegacyProviderAdapter } from 'web3x-es/providers'
import { Address } from 'web3x-es/address'
import { ChainId } from '@dcl/schemas'
import { connection, ProviderType } from 'decentraland-connect'
import {
  ReplacedTransaction,
  TransactionStatus,
  AnyTransaction,
  QueuedTransaction,
  PendingTransaction,
  RevertedTransaction,
  ConfirmedTransaction
} from './types'

export async function getTransaction(
  address: string,
  chainId: ChainId,
  hash: string
): Promise<AnyTransaction | null> {
  const provider = await connection.createProvider(
    ProviderType.NETWORK,
    chainId
  )
  if (!provider) return null

  const eth = new Eth(new LegacyProviderAdapter(provider as any))

  if (!address) {
    return null
  }

  let currentNonce: number | null = null
  try {
    currentNonce = await eth.getTransactionCount(Address.fromString(address))
  } catch (error) {
    console.warn(
      `Could not get current nonce for account "${address}"`,
      error.message
    )
  }

  let response: TransactionResponse | null = null
  try {
    response = await eth.getTransaction(hash)
  } catch (error) {
    console.warn(`Could not get transaction for hash "${hash}"`, error.message)
  }

  // not found
  if (response == null) {
    return null
  }

  if (response.blockNumber == null) {
    if (currentNonce != null) {
      // replaced
      if (response.nonce < currentNonce) {
        const tx: ReplacedTransaction = {
          hash,
          status: TransactionStatus.REPLACED,
          nonce: response.nonce
        }
        return tx
      }

      // queued
      if (response.nonce > currentNonce) {
        const tx: QueuedTransaction = {
          hash,
          status: TransactionStatus.QUEUED,
          nonce: response.nonce
        }
        return tx
      }
    }

    // pending
    const tx: PendingTransaction = {
      status: TransactionStatus.PENDING,
      ...response
    }
    return tx
  }

  const receipt = await eth.getTransactionReceipt(hash)

  // reverted
  if (receipt == null || !receipt.status) {
    const tx: RevertedTransaction = {
      status: TransactionStatus.REVERTED,
      ...response
    }
    return tx
  }

  // confirmed
  const tx: ConfirmedTransaction = {
    status: TransactionStatus.CONFIRMED,
    ...response,
    receipt
  }
  return tx
}
