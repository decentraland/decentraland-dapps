import { Dispatch } from 'redux'
import { ContractName } from 'decentraland-transactions'
import { Contract } from '@dcl/schemas'
import { Wallet } from '../../modules/wallet/types'
import {
  AuthorizationFlowClearAction,
  AuthorizationFlowRequestAction,
  authorizationFlowClear,
  authorizationFlowRequest,
  FetchAuthorizationsRequestAction
} from '../../modules/authorization/actions'
import {
  Authorization,
  AuthorizationType
} from '../../modules/authorization/types'
import { en } from '../../modules/translation/defaults'
type AuthorizeBaseOptions = {
  /**
   * callback to run when authorization process is completed
   * @param alreadyAuthorized when true, the user was authorizarized when calling
   * onAuthorizedAction without the need to run the complete authorization flow
   * */
  onAuthorized: (alreadyAuthorized: boolean) => void
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
  targetContractLabel?: string
  tokenId: string
}

type AllowanceOptions = AuthorizeBaseOptions & {
  authorizationType: AuthorizationType.ALLOWANCE
  requiredAllowanceInWei: string
}

type MintOptions = AuthorizeBaseOptions & {
  authorizationType: AuthorizationType.MINT
  targetContractLabel?: string
}

export type AuthorizeActionOptions =
  | ApprovalOptions
  | AllowanceOptions
  | MintOptions

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P]
}

export type AuthorizationTranslationKeys = RecursivePartial<
  typeof en['@dapps']['authorization_modal']
>

export type WithAuthorizedActionProps = {
  onAuthorizedAction: (options: AuthorizeActionOptions) => void
  onCloseAuthorization: () => void
  isLoadingAuthorization: boolean
  authorizationError: string | null
  isUsingMagic: boolean
  isMagicAutoSignEnabled: boolean
}

export type MapStateProps = {
  authorizerWallet: Wallet | null
  isAuthorizing: boolean
  authorizationError: string | null
  isMagicAutoSignEnabled: boolean
}
export type MapDispatch = Dispatch<
  | AuthorizationFlowClearAction
  | AuthorizationFlowRequestAction
  | FetchAuthorizationsRequestAction
>
export type MapDispatchProps = {
  onClearAuthorizationFlow: typeof authorizationFlowClear
  onRevoke: (
    traceId: string,
    authorization: Authorization
  ) => ReturnType<typeof authorizationFlowRequest>
  onGrant: (
    traceId: string,
    authorization: Authorization
  ) => ReturnType<typeof authorizationFlowRequest>
}
