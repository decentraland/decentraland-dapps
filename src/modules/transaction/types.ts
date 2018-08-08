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
}

export interface TransactionPayload {
  [hash: string]: {
    hash: string
    payload: any
    events: string[]
  }
}

export enum NetworkName {
  mainnet = 'mainnet',
  ropsten = 'ropsten',
  kovan = 'kovan',
  rinkeby = 'rinkeby'
}
