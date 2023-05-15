import { Dispatch } from 'redux'
import { ContractName } from 'decentraland-transactions'
import { Contract } from '@dcl/schemas'
import {
  AuthorizationFlowClearAction,
  authorizationFlowClear
} from '../../modules/authorization/actions'
import { AuthorizationType } from '../../modules/authorization/types'

type AuthorizeBaseOptions = {
  /**
   * callback to run when authorization process is completed
   * source indicates where is the onAuthorized function being called from.
   * If the user was already authorized then source will be 'action'
   * If the authorization modal is opened, then source will be 'modal'
   * */
  onAuthorized: (source: 'modal' | 'action') => void
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
export type MapDispatch = Dispatch<AuthorizationFlowClearAction>
export type MapDispatchProps = {
  onClearAuthorizationFlow: typeof authorizationFlowClear
}
