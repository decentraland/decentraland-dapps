import { MiddlewareAPI, Dispatch, AnyAction, Action } from 'redux'
import { AuthorizationState } from './modules/authorization/reducer'
import { TransactionState } from './modules/transaction/reducer'
import { WalletState } from './modules/wallet/reducer'
import { FeaturesState } from './modules/features/reducer'
import { LoadingState } from './modules/loading/reducer'

export type RootDispatch<A extends Action = AnyAction> = Dispatch<A>

export type RootMiddleware = (
  store: MiddlewareAPI<any>
) => (next: RootDispatch<AnyAction>) => (action: AnyAction) => any

export type RootState = {
  authorization: AuthorizationState
  transaction: TransactionState
  wallet: WalletState
  features: FeaturesState
  loading: LoadingState
  [key: string]: any // Allow other modules that might be added by consumers
}
