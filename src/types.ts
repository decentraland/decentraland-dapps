import { MiddlewareAPI, Dispatch, AnyAction, Action } from 'redux'

export type RootDispatch<A extends Action = AnyAction> = Dispatch<A>

export type RootMiddleware = (
  store: MiddlewareAPI<any>
) => (next: RootDispatch<AnyAction>) => (action: AnyAction) => any

// RootStateOrAny was removed in react-redux v8
// Using 'any' here because this library is consumed by different dApps
// that may have different Redux state structures
export type RootStateOrAny = any
