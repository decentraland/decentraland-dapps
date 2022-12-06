import { Network } from '@dcl/schemas'
import { action } from 'typesafe-actions'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { MoonPayTransactionStatus } from './moonpay/types'

// Open MANA-FIAT Gateway
export const OPEN_MANA_FIAT_GATEWAY = 'Open MANA-FIAT Gateway'

export const openManaFiatGateway = (
  network: Network,
  gateway: NetworkGatewayType
) => action(OPEN_MANA_FIAT_GATEWAY, { network, gateway })

export type OpenManaFiatGatewayAction = ReturnType<typeof openManaFiatGateway>

// Set Widget Url
export const SET_WIDGET_URL = 'Set Widget Url'

export const setWidgetUrl = (widgetUrl: string) =>
  action(SET_WIDGET_URL, { widgetUrl })

export type SetWidgetUrlAction = ReturnType<typeof setWidgetUrl>

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
