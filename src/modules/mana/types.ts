import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'

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
  gateway: NetworkGatewayType
  timestamp: number
  status: PurchaseStatus
  address: string
  txHash: string | null
}
