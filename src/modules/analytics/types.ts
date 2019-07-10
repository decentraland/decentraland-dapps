import { AnyAction } from 'redux'

export interface AnalyticsWindow extends Window {
  analytics: SegmentAnalytics.AnalyticsJS
}

export type ActionType = AnyAction['type']
export type EventName = string | ((action: AnyAction) => string)
export type GetPayload = (action: AnyAction) => { [key: string]: any } | string
export type TrackPayload = string | undefined | Record<string, any>
export type TransformPayload = (payload: TrackPayload) => TrackPayload

export interface AnalyticsAction {
  actionType: ActionType
  eventName?: EventName
  getPayload?: GetPayload
}
