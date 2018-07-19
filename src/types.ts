import { MiddlewareAPI, AnyAction } from 'redux'

export interface RootDispatch<A = AnyAction> {
  (action: A): A
}

export type RootMiddleware = (
  store: MiddlewareAPI<any>
) => (next: RootDispatch<AnyAction>) => (action: AnyAction) => any
