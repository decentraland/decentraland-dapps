import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui'
import { MoonPayTransactionStatus } from '../gateway/moonpay/types'

export type RedirectTransactionQuery = {
  network?: Network
  gateway?: NetworkGatewayType
  transactionId?: string
  transactionStatus?: MoonPayTransactionStatus
}
