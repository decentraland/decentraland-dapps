import { MiddlewareAPI, Dispatch, AnyAction, Action } from 'redux'

export type RootDispatch<A extends Action = AnyAction> = Dispatch<A>

export type RootMiddleware = (
  store: MiddlewareAPI<any>
) => (next: RootDispatch<AnyAction>) => (action: AnyAction) => any
