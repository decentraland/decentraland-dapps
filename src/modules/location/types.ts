import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui'

export type RedirectTransactionQuery = {
  network?: Network
  gateway?: NetworkGatewayType
  transactionId?: string
  transactionStatus?: string
}
