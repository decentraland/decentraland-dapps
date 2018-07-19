import { AnyAction } from 'redux'
import {
  AnalyticsAction,
  ActionType,
  EventName,
  GetPayload,
  AnalyticsWindow
} from './types'

export const trackedActions: { [key: string]: AnalyticsAction } = {}

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

    analytics.track(event, payload)
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
