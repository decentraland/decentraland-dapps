import { Network } from '@dcl/schemas'
import { action } from 'typesafe-actions'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { MoonPayTransactionStatus } from './moonpay/types'

// Open MANA-FIAT Gateway
export const OPEN_MANA_FIAT_GATEWAY_REQUEST = '[Request] Open MANA-FIAT Gateway'
export const OPEN_MANA_FIAT_GATEWAY_SUCCESS = '[Success] Open MANA-FIAT Gateway'
export const OPEN_MANA_FIAT_GATEWAY_FAILURE = '[Failure] Open MANA-FIAT Gateway'

export const openManaFiatGatewayRequest = (
  network: Network,
  gateway: NetworkGatewayType
) => action(OPEN_MANA_FIAT_GATEWAY_REQUEST, { network, gateway })

export const openManaFiatGatewaySuccess = () =>
  action(OPEN_MANA_FIAT_GATEWAY_SUCCESS)

export const openManaFiatGatewayFailure = (
  network: Network,
  gateway: NetworkGatewayType,
  error: string
) => action(OPEN_MANA_FIAT_GATEWAY_FAILURE, { network, gateway, error })

export type OpenManaFiatGatewayRequestAction = ReturnType<
  typeof openManaFiatGatewayRequest
>
export type OpenManaFiatGatewaySuccessAction = ReturnType<
  typeof openManaFiatGatewaySuccess
>
export type OpenManaFiatGatewayFailureAction = ReturnType<
  typeof openManaFiatGatewayFailure
>

// MANA-FIAT Gateway Purchase Completed
export const MANA_FIAT_GATEWAY_PURCHASE_COMPLETED =
  '[Request] MANA-FIAT Gateway Purchase Completed'
export const MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE =
  '[Failure] MANA-FIAT Gateway Purchase Completed'

export const manaFiatGatewayPurchaseCompleted = (
  network: Network,
  gateway: NetworkGatewayType,
  transactionId: string,
  status: MoonPayTransactionStatus
) =>
  action(MANA_FIAT_GATEWAY_PURCHASE_COMPLETED, {
    network,
    gateway,
    transactionId,
    status
  })
export const manaFiatGatewayPurchaseCompletedFailure = (
  network: Network,
  gateway: NetworkGatewayType,
  transactionId: string,
  error: string
) =>
  action(MANA_FIAT_GATEWAY_PURCHASE_COMPLETED_FAILURE, {
    network,
    gateway,
    transactionId,
    error
  })

export type ManaFiatGatewayPurchaseCompletedAction = ReturnType<
  typeof manaFiatGatewayPurchaseCompleted
>
export type ManaFiatGatewayPurchaseCompletedFailureAction = ReturnType<
  typeof manaFiatGatewayPurchaseCompletedFailure
>
