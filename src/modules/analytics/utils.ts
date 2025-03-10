import { AnyAction } from 'redux'
import { isbot } from 'isbot'
import { Wallet } from '../wallet/types'
import {
  AnalyticsAction,
  ActionType,
  EventName,
  GetPayload,
  AnalyticsWindow,
  TransformPayload
} from './types'

export const trackedActions: { [key: string]: AnalyticsAction } = {}

let transformPayload: TransformPayload | null = null

export function add(
  actionType: ActionType,
  eventName?: EventName,
  getPayload?: GetPayload
) {
  if (actionType in trackedActions) {
    console.warn(
      `Analytics: the action type "${actionType}" is already being tracked!`
    )
    return
  }
  trackedActions[actionType] = { actionType, eventName, getPayload }
}

export function track(action: AnyAction) {
  const analytics = getAnalytics()
  if (!analytics) return

  if (isTrackable(action)) {
    const { eventName, getPayload } = trackedActions[action.type]

    let event = action.type
    if (eventName) {
      if (typeof eventName === 'string') {
        event = eventName
      } else {
        event = eventName(action)
      }
    }

    let payload
    if (getPayload) {
      payload = getPayload(action)
    }

    analytics.track(
      event,
      transformPayload ? transformPayload(payload) : payload
    )
  }
}

export function isTrackable(action: AnyAction) {
  if (action && action.type) {
    return action.type in trackedActions
  }
  console.warn(`Analytics: invalid action "${JSON.stringify(action)}"`)
  return false
}

export function getAnalytics() {
  const userAgent = window.navigator.userAgent

  const isBot = isbot(userAgent)
  if (isBot) {
    return undefined
  }

  return (window as AnalyticsWindow).analytics
}

export function configure(params: { transformPayload?: TransformPayload }) {
  if (params.transformPayload) {
    transformPayload = params.transformPayload
  }
}

/**
 * Useful function for when you are not integrating the analytics module into your project
 * and want to manually track this event the same way as if the saga was integrated.
 */
export function trackConnectWallet(
  props: Pick<Wallet, 'address' | 'providerType' | 'chainId'> & {
    // The name of the wallet used to connect. Not to be confused with the providerType.
    // This would be, for example, "Trust Wallet" when connecting via WalletConnect.
    walletName?: string
  }
) {
  const analytics = getAnalytics()

  if (analytics) {
    analytics.track('Connect Wallet', props)
  }
}

export function getAnonymousId() {
  const analytics = getAnalytics()
  if (analytics) {
    return analytics.user().anonymousId()
  } else {
    return undefined
  }
}
