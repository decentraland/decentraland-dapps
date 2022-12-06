import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui'
import { MoonPayTransactionStatus } from '../manaFiatGateway/moonpay/types'

export type RedirectTransactionQuery = {
  network?: Network
  gateway?: NetworkGatewayType
  transactionId?: string
  transactionStatus?: MoonPayTransactionStatus
}
