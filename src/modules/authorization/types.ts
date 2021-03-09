import { ChainId } from '@dcl/schemas'

export enum AuthorizationType {
  ALLOWANCE = 'allowance',
  APPROVAL = 'approval'
}

export enum AuthorizationAction {
  GRANT = 'grant',
  REVOKE = 'revoke'
}

export type Authorization = {
  type: AuthorizationType
  address: string
  tokenAddress: string
  authorizedAddress: string
  chainId: ChainId
}
