import { AnyAction } from 'redux'
import {
  AnalyticsAction,
  ActionType,
  EventName,
  GetPayload,
  AnalyticsWindow
} from './types'

export const trackedActions: { [key: string]: AnalyticsAction } = {}

let globalPayload: Record<string, any> | null = null

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

    const isSimplePayload = typeof payload === 'string' || payload === undefined
    const ignoreGlobalPayload = !globalPayload || isSimplePayload

    if (isSimplePayload && globalPayload) {
      console.warn(
        `Warning: tracked event payload (${payload}) can not be merged with configured global payload`
      )
    }

    analytics.track(
      event,
      ignoreGlobalPayload
        ? payload
        : { ...(payload as Record<string, any>), ...globalPayload }
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
  return (window as AnalyticsWindow).analytics
}

export function configure(params: { payload?: Record<string, any> }) {
  if (params.payload) {
    globalPayload = params.payload
  }
}
