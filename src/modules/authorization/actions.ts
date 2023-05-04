import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { action } from 'typesafe-actions'
import { buildTransactionPayload } from '../transaction/utils'
import { Authorization, AuthorizationAction } from './types'

// Fetch authorizations

export const FETCH_AUTHORIZATIONS_REQUEST = '[Request] Fetch Authorizations'
export const FETCH_AUTHORIZATIONS_SUCCESS = '[Success] Fetch Authorizations'
export const FETCH_AUTHORIZATIONS_FAILURE = '[Failure] Fetch Authorizations'

export const fetchAuthorizationsRequest = (authorizations: Authorization[]) =>
  action(FETCH_AUTHORIZATIONS_REQUEST, { authorizations })

/**
 * @param authorizations Tuple of the original authorization used to fetch and the authorization fetched result.
 * Necessary by the reducer to be able to remove authorizations fetched that now are not authorized anymore.
 */
export const fetchAuthorizationsSuccess = (
  authorizations: [Authorization, Authorization | null][]
) => action(FETCH_AUTHORIZATIONS_SUCCESS, { authorizations })

export const fetchAuthorizationsFailure = (
  authorizations: Authorization[],
  error: string
) => action(FETCH_AUTHORIZATIONS_FAILURE, { authorizations, error })

export type FetchAuthorizationsRequestAction = ReturnType<
  typeof fetchAuthorizationsRequest
>
export type FetchAuthorizationsSuccessAction = ReturnType<
  typeof fetchAuthorizationsSuccess
>
export type FetchAuthorizationsFailureAction = ReturnType<
  typeof fetchAuthorizationsFailure
>

// Grant Token

export const GRANT_TOKEN_REQUEST = '[Request] Grant Token'
export const GRANT_TOKEN_SUCCESS = '[Success] Grant Token'
export const GRANT_TOKEN_FAILURE = '[Failure] Grant Token'

export const grantTokenRequest = (authorization: Authorization) =>
  action(GRANT_TOKEN_REQUEST, {
    authorization
  })

export const grantTokenSuccess = (
  authorization: Authorization,
  chainId: ChainId,
  txHash: string
) =>
  action(GRANT_TOKEN_SUCCESS, {
    ...buildTransactionPayload(chainId, txHash, {
      authorization
    }),
    authorization
  })

export const grantTokenFailure = (
  authorization: Authorization,
  error: string
) => action(GRANT_TOKEN_FAILURE, { authorization, error })

export type GrantTokenRequestAction = ReturnType<typeof grantTokenRequest>
export type GrantTokenSuccessAction = ReturnType<typeof grantTokenSuccess>
export type GrantTokenFailureAction = ReturnType<typeof grantTokenFailure>

// Revoke Token

export const REVOKE_TOKEN_REQUEST = '[Request] Revoke Token'
export const REVOKE_TOKEN_SUCCESS = '[Success] Revoke Token'
export const REVOKE_TOKEN_FAILURE = '[Failure] Revoke Token'

export const revokeTokenRequest = (authorization: Authorization) =>
  action(REVOKE_TOKEN_REQUEST, {
    authorization
  })

export const revokeTokenSuccess = (
  authorization: Authorization,
  chainId: ChainId,
  txHash: string
) =>
  action(REVOKE_TOKEN_SUCCESS, {
    ...buildTransactionPayload(chainId, txHash, {
      authorization
    }),
    authorization
  })

export const revokeTokenFailure = (
  authorization: Authorization,
  error: string
) => action(REVOKE_TOKEN_FAILURE, { authorization, error })

export type RevokeTokenRequestAction = ReturnType<typeof revokeTokenRequest>
export type RevokeTokenSuccessAction = ReturnType<typeof revokeTokenSuccess>
export type RevokeTokenFailureAction = ReturnType<typeof revokeTokenFailure>

// Authorization Flow
export const AUTHORIZATION_FLOW_REQUEST = '[Request] Authorization Flow'
export const AUTHORIZATION_FLOW_SUCCESS = '[Success] Authorization Flow'
export const AUTHORIZATION_FLOW_FAILURE = '[Failure] Authorization Flow'

export const authorizationFlowRequest = (
  authorization: Authorization,
  authorizationAction: AuthorizationAction,
  allowance?: string
) =>
  action(AUTHORIZATION_FLOW_REQUEST, {
    authorization,
    authorizationAction,
    allowance
  })

export const authorizationFlowSuccess = (authorization: Authorization) =>
  action(AUTHORIZATION_FLOW_SUCCESS, {
    authorization
  })

export const authorizationFlowFailure = (
  authorization: Authorization,
  error: string
) => action(AUTHORIZATION_FLOW_FAILURE, { authorization, error })

export type AuthorizationFlowRequestAction = ReturnType<
  typeof authorizationFlowRequest
>
export type AuthorizationFlowSuccessAction = ReturnType<
  typeof authorizationFlowSuccess
>
export type AuthorizationFlowFailureAction = ReturnType<
  typeof authorizationFlowFailure
>
