import { action } from 'typesafe-actions'
import { AuthIdentity } from '@dcl/crypto'

// Generate identity

export const GENERATE_IDENTITY_SUCCESS = '[Success] Generate Identity'
export const GENERATE_IDENTITY_FAILURE = '[Failure] Generate Identity'

export const generateIdentitySuccess = (
  address: string,
  identity: AuthIdentity
) => action(GENERATE_IDENTITY_SUCCESS, { address, identity })
export const generateIdentityFailure = (address: string, error: string) =>
  action(GENERATE_IDENTITY_FAILURE, { address, error })

export type GenerateIdentitySuccessAction = ReturnType<
  typeof generateIdentitySuccess
>
export type GenerateIdentityFailureAction = ReturnType<
  typeof generateIdentityFailure
>
