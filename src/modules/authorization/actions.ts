import { ChainId } from '@dcl/schemas'
import { action } from 'typesafe-actions'
import { buildTransactionPayload } from '../transaction/utils'
import { Authorization } from './types'

// Fetch authorization

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
