import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { action } from 'typesafe-actions'
import { buildTransactionPayload } from '../transaction/utils'
import { Authorization } from './types'

// Fetch authorizations

export const FETCH_AUTHORIZATIONS_REQUEST = '[Request] Fetch Authorizations'
export const FETCH_AUTHORIZATIONS_SUCCESS = '[Success] Fetch Authorizations'
export const FETCH_AUTHORIZATIONS_FAILURE = '[Failure] Fetch Authorizations'

export const fetchAuthorizationsRequest = (authorizations: Authorization[]) =>
  action(FETCH_AUTHORIZATIONS_REQUEST, { authorizations })

export const fetchAuthorizationsSuccess = (authorizations: Authorization[]) =>
  action(FETCH_AUTHORIZATIONS_SUCCESS, { authorizations })

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

// Fetch authorization

export const FETCH_AUTHORIZATION_REQUEST = '[Request] Fetch Authorization'
export const FETCH_AUTHORIZATION_SUCCESS = '[Success] Fetch Authorization'
export const FETCH_AUTHORIZATION_FAILURE = '[Failure] Fetch Authorization'

export const fetchAuthorizationRequest = (authorization: Authorization) =>
  action(FETCH_AUTHORIZATION_REQUEST, { authorization })

export const fetchAuthorizationSuccess = (
  authorization: Authorization | null
) => action(FETCH_AUTHORIZATION_SUCCESS, { authorization })

export const fetchAuthorizationFailure = (
  authorization: Authorization,
  error: string
) => action(FETCH_AUTHORIZATION_FAILURE, { authorization, error })

export type FetchAuthorizationRequestAction = ReturnType<
  typeof fetchAuthorizationRequest
>
export type FetchAuthorizationSuccessAction = ReturnType<
  typeof fetchAuthorizationSuccess
>
export type FetchAuthorizationFailureAction = ReturnType<
  typeof fetchAuthorizationFailure
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
