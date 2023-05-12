import { Dispatch } from 'redux'
import { ContractName } from 'decentraland-transactions'
import { Contract } from '@dcl/schemas'
import { FetchAuthorizationsRequestAction } from '../../modules/authorization/actions'
import { AuthorizationType } from '../../modules/authorization/types'

type AuthorizeBaseOptions = {
  /** callback to run when authorization process is completed */
  onAuthorized: () => void
  /** address that we want to authorize */
  authorizedAddress: string
  /** contract the should be called to check authorization and authorize */
  targetContract: Contract
  /** name of the target contract */
  targetContractName: ContractName
  /** name of authorized contract */
  authorizedContractLabel?: string
}

type ApprovalOptions = AuthorizeBaseOptions & {
  authorizationType: AuthorizationType.APPROVAL
  tokenId: string
}

type AllowanceOptions = AuthorizeBaseOptions & {
  authorizationType: AuthorizationType.ALLOWANCE
  requiredAllowanceInWei: string
}

export type AuthorizeActionOptions = ApprovalOptions | AllowanceOptions

export type WithAuthorizedActionProps = {
  onAuthorizedAction: (options: AuthorizeActionOptions) => void
  isLoadingAuthorization: boolean
}

export type MapStateProps = { address: string | undefined }
export type MapDispatch = Dispatch<FetchAuthorizationsRequestAction>
