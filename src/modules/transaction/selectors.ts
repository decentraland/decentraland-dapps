import { TransactionState, TransactionStatus } from './types'

export const getState: (state: any) => TransactionState = state =>
  state.transaction
export const getData: (state: any) => TransactionState['data'] = state =>
  getState(state).data
export const getLoading: (state: any) => TransactionState['loading'] = state =>
  getState(state).loading

export const getTransactionsByStatus = (
  state: any,
  address: string,
  status: TransactionStatus
) =>
  getData(state).filter(item => item.from === address && item.status === status)

export const getPendingTransactions = (state: any, address: string) =>
  getTransactionsByStatus(state, address, TransactionStatus.Pending)

export const getTransactionHistory = (state: any, address: string) =>
  getData(state).filter(
    item => item.from === address && item.status !== TransactionStatus.Pending
  )

export const getTransactionsByType = (
  state: any,
  address: string,
  type: string
) =>
  getData(state).filter(
    item => item.from === address && item.actionType === type
  )
