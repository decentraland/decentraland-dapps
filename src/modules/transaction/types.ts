export enum TransactionStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Failed = 'failed'
}

export interface Transaction {
  events: string[]
  hash: string
  timestamp: number
  from: string
  actionType: string
  status: TransactionStatus
  withReceipt?: boolean
  receipt?: Receipt
}

export interface TransactionPayload {
  [hash: string]: {
    hash: string
    payload: any
    events: string[]
    withReceipt?: boolean
  }
}

export enum NetworkName {
  mainnet = 'mainnet',
  ropsten = 'ropsten',
  kovan = 'kovan',
  rinkeby = 'rinkeby'
}

export interface Arg {
  name: string
  type: string
  value: string
}

export interface Log {
  events: Arg[]
  name: string
  [key: string]: any
}

export interface Receipt {
  logs: Log[]
}
