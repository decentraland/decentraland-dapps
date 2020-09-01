import { Eth } from 'web3x-es/eth'
import { TransactionResponse } from 'web3x-es/formatters'
import { Address } from 'web3x-es/address'
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
  hash: string
): Promise<AnyTransaction | null> {
  const eth = Eth.fromCurrentProvider()
  if (!eth) return null

  let accounts: Address[] = []
  try {
    accounts = await eth.getAccounts()
  } catch (error) {
    console.warn(`Could not get accounts`, error.message)
  }

  if (accounts.length === 0) {
    return null
  }

  let currentNonce: number | null = null
  try {
    currentNonce = await eth.getTransactionCount(accounts[0])
  } catch (error) {
    console.warn(
      `Could not get current nonce for account "${accounts[0]}"`,
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

  if (receipt == null) {
    // pending (in block, but not yet mined)
    const tx: PendingTransaction = {
      status: TransactionStatus.PENDING,
      ...response
    }
    return tx
  }

  // reverted
  if (!receipt.status) {
    const tx: RevertedTransaction = {
      status: TransactionStatus.REVERTED,
      ...response,
      receipt
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
