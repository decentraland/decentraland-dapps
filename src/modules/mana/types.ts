import { Network } from '@dcl/schemas'

export enum PurchaseStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  COMPLETE = 'complete'
}

export type Purchase = {
  id: string
  amount: number
  network: Network
  timestamp: number
  status: PurchaseStatus
  address: string
}
