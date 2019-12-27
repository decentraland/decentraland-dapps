import { Transaction, TransactionStatus } from './types'
import { TransactionState } from './reducer'
import { isPending } from './utils'

const sortByTimestamp = (a: Transaction, b: Transaction) =>
  a.timestamp > b.timestamp ? -1 : 1

export const getState: (state: any) => TransactionState = state =>
  state.transaction
export const getData: (state: any) => TransactionState['data'] = state =>
  getState(state).data
export const getLoading: (state: any) => TransactionState['loading'] = state =>
  getState(state).loading

export const getTransaction = (
  state: any,
  hash: string
): Transaction | undefined => getData(state).find(tx => tx.hash === hash)

export const getTransactionsByStatus = (
  state: any,
  address: string,
  status: TransactionStatus
): Transaction[] =>
  getData(state)
    .filter(tx => tx.from === address && tx.status === status)
    .sort(sortByTimestamp)

export const getTransactions = (state: any, address: string): Transaction[] =>
  getData(state)
    .filter(tx => tx.from === address)
    .sort(sortByTimestamp)

export const getPendingTransactions = (
  state: any,
  address: string
): Transaction[] =>
  getData(state)
    .filter(tx => tx.from === address && isPending(tx.status))
    .sort(sortByTimestamp)

export const getTransactionHistory = (
  state: any,
  address: string
): Transaction[] =>
  getData(state)
    .filter(tx => tx.from === address && !isPending(tx.status))
    .sort(sortByTimestamp)

export const getTransactionsByType = (
  state: any,
  address: string,
  type: string
): Transaction[] =>
  getData(state)
    .filter(tx => tx.from === address && tx.actionType === type)
    .sort(sortByTimestamp)
