import { RootMiddleware } from '../../types'
import {
  FETCH_AUTHORIZATIONS_SUCCESS,
  GRANT_TOKEN_SUCCESS,
  REVOKE_TOKEN_SUCCESS
} from '../authorization/actions'
import { AuthorizationReducerAction } from '../authorization/reducer'
import { CHANGE_PROFILE, LOAD_PROFILE_SUCCESS } from '../profile/actions'
import { ProfileReducerAction } from '../profile/reducer'
import {
  CLEAR_TRANSACTIONS,
  FETCH_TRANSACTION_REQUEST,
  FETCH_TRANSACTION_SUCCESS
} from '../transaction/actions'
import { TransactionReducerAction } from '../transaction/reducer'
import {
  CHANGE_ACCOUNT,
  CHANGE_NETWORK,
  CONNECT_WALLET_SUCCESS,
  FETCH_WALLET_SUCCESS
} from '../wallet/actions'
import { WalletReducerAction } from '../wallet/reducer'

export const createCommonMiddleware = () => {
  const middleware: RootMiddleware = () => next => (
    action:
      | WalletReducerAction
      | ProfileReducerAction
      | TransactionReducerAction
      | AuthorizationReducerAction
  ) => {
    switch (action.type) {
      case FETCH_WALLET_SUCCESS:
      case CONNECT_WALLET_SUCCESS:
      case CHANGE_ACCOUNT:
      case CHANGE_NETWORK:
        action.payload.wallet.address = action.payload.wallet.address.toLowerCase()
        break
      case LOAD_PROFILE_SUCCESS:
      case FETCH_TRANSACTION_REQUEST:
      case CLEAR_TRANSACTIONS:
      case CHANGE_PROFILE:
        action.payload.address = action.payload.address.toLowerCase()
        break
      case FETCH_AUTHORIZATIONS_SUCCESS:
        action.payload.authorizations = action.payload.authorizations.map(
          authorization => ({
            ...authorization,
            contractAddress: authorization.contractAddress.toLowerCase(),
            authorizedAddress: authorization.authorizedAddress.toLowerCase()
          })
        )
        break
      case FETCH_TRANSACTION_SUCCESS:
        const transaction = action.payload.transaction

        switch (transaction.actionType) {
          case GRANT_TOKEN_SUCCESS:
          case REVOKE_TOKEN_SUCCESS: {
            const { authorization } = transaction.payload
            authorization.contractAddress = authorization.contractAddress.toLowerCase()
            authorization.authorizedAddress = authorization.authorizedAddress.toLowerCase()
            break
          }
        }
        break
    }

    return next(action)
  }

  return middleware
}
