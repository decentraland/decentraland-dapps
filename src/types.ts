import { MiddlewareAPI, Dispatch, AnyAction } from 'redux'

export type RootDispatch<A = AnyAction> = Dispatch<A>

export type RootMiddleware = (
  store: MiddlewareAPI<any>
) => (next: RootDispatch<AnyAction>) => (action: AnyAction) => any
