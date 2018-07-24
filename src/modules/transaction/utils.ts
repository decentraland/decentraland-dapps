import { AnyAction } from 'redux'
import {
  Transaction,
  TransactionPayload,
} from './types'

// Special flag used to determine transaction hashes to be monitored
export const TRANSACTION_ACTION_FLAG = '_watch_tx'

export function isTransactionAction(action: AnyAction): boolean {
  return !!getTransactionFromAction(action)
}

export function getTransactionFromAction(action: AnyAction): Transaction {
  return action.payload && action.payload[TRANSACTION_ACTION_FLAG]
}

export function getTransactionHashFromAction(
  action: AnyAction
): Transaction['hash'] {
  return getTransactionFromAction(action).hash
}

export function buildTransactionPayload(
  hash: string,
  payload = {},
  events: string[] = []
): TransactionPayload {
  return {
    [TRANSACTION_ACTION_FLAG]: {
      hash,
      payload,
      events
    }
  }
}
