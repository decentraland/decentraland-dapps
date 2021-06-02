import { ChainId } from '@dcl/schemas'
import { ContractName } from 'decentraland-transactions'

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
  contractAddress: string
  authorizedAddress: string
  contractName: ContractName
  chainId: ChainId
}

export type AuthorizationSagaOptions = {
  metaTransactionServerUrl?: string
}
