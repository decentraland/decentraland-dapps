import { Network } from '@dcl/schemas/dist/dapps/network'
import { action } from 'typesafe-actions'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { getChainIdByNetwork } from '../../lib/eth'
import { buildTransactionWithFromPayload } from '../transaction/utils'
import { MoonPayTransactionStatus } from './moonpay/types'
import {
  FiatGateway,
  FiatGatewayListeners,
  FiatGatewayOptions,
  Purchase
} from './types'

// Open MANA-FIAT Gateway
export const OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST =
  '[Request] Open Buy MANA with FIAT Modal'
export const OPEN_BUY_MANA_WITH_FIAT_MODAL_SUCCESS =
  '[Success] Open Buy MANA with FIAT Modal'
export const OPEN_BUY_MANA_WITH_FIAT_MODAL_FAILURE =
  '[Failure] Open Buy MANA with FIAT Modal'

export const openBuyManaWithFiatModalRequest = (selectedNetwork?: Network) =>
  action(OPEN_BUY_MANA_WITH_FIAT_MODAL_REQUEST, { selectedNetwork })

export const openBuyManaWithFiatModalSuccess = () =>
  action(OPEN_BUY_MANA_WITH_FIAT_MODAL_SUCCESS)

export const openBuyManaWithFiatModalFailure = (error: string) =>
  action(OPEN_BUY_MANA_WITH_FIAT_MODAL_FAILURE, { error })

export type OpenBuyManaWithFiatModalRequestAction = ReturnType<
  typeof openBuyManaWithFiatModalRequest
>
export type OpenBuyManaWithFiatModalSuccessAction = ReturnType<
  typeof openBuyManaWithFiatModalSuccess
>
export type OpenBuyManaWithFiatModalFailureAction = ReturnType<
  typeof openBuyManaWithFiatModalFailure
>

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

// Add MANA Purchase as Transaction
export const ADD_MANA_PURCHASE_AS_TRANSACTION =
  'Add MANA Purchase as Transaction'

export const addManaPurchaseAsTransaction = (purchase: Purchase) => {
  if (!purchase.txHash) {
    throw new Error(`Transaction Hash is undefined for purchase ${purchase.id}`)
  }

  return action(ADD_MANA_PURCHASE_AS_TRANSACTION, {
    purchase,
    ...buildTransactionWithFromPayload(
      getChainIdByNetwork(purchase.network),
      purchase.txHash,
      purchase.address,
      {
        purchase
      }
    )
  })
}

export type AddManaPurchaseAsTransactionAction = ReturnType<
  typeof addManaPurchaseAsTransaction
>

// Set Purchase
export const SET_PURCHASE = 'Set Purchase'
export const setPurchase = (purchase: Purchase) =>
  action(SET_PURCHASE, { purchase })
export type SetPurchaseAction = ReturnType<typeof setPurchase>

// Poll Purchase Status
export const POLL_PURCHASE_STATUS_REQUEST = '[Request] Poll Purchase Status'
export const POLL_PURCHASE_STATUS_SUCCESS = '[Success] Poll Purchase Status'
export const POLL_PURCHASE_STATUS_FAILURE = '[Failure] Poll Purchase Status'

export const pollPurchaseStatusRequest = (purchase: Purchase) =>
  action(POLL_PURCHASE_STATUS_REQUEST, { purchase })

export const pollPurchaseStatusSuccess = () =>
  action(POLL_PURCHASE_STATUS_SUCCESS)

export const pollPurchaseStatusFailure = (error: string) =>
  action(POLL_PURCHASE_STATUS_FAILURE, { error })

export type PollPurchaseStatusRequestAction = ReturnType<
  typeof pollPurchaseStatusRequest
>
export type PollPurchaseStatusSuccessAction = ReturnType<
  typeof pollPurchaseStatusSuccess
>
export type PollPurchaseStatusFailureAction = ReturnType<
  typeof pollPurchaseStatusFailure
>

// Open FIAT Gateway
export const OPEN_FIAT_GATEWAY_WIDGET_REQUEST =
  '[Request] Open FIAT Gateway Widget'
export const OPEN_FIAT_GATEWAY_WIDGET_SUCCESS =
  '[Success] Open FIAT Gateway Widget'
export const OPEN_FIAT_GATEWAY_WIDGET_FAILURE =
  '[Failure] Open FIAT Gateway Widget'

export const openFiatGatewayWidgetRequest = (
  gateway: FiatGateway,
  data: FiatGatewayOptions,
  listeners?: FiatGatewayListeners
) =>
  action(OPEN_FIAT_GATEWAY_WIDGET_REQUEST, {
    gateway,
    data,
    listeners
  })

export const openFiatGatewayWidgetSuccess = () =>
  action(OPEN_FIAT_GATEWAY_WIDGET_SUCCESS)

export const openFiatGatewayWidgetFailure = (error: string) =>
  action(OPEN_FIAT_GATEWAY_WIDGET_FAILURE, { error })

export type OpenFiatGatewayWidgetRequestAction = ReturnType<
  typeof openFiatGatewayWidgetRequest
>
export type OpenFiatGatewayWidgetSuccessAction = ReturnType<
  typeof openFiatGatewayWidgetSuccess
>
export type OpenFiatGatewayWidgetFailureAction = ReturnType<
  typeof openFiatGatewayWidgetFailure
>
