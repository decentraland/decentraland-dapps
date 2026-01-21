import { BigNumber } from "ethers";
import { Dispatch } from "redux";
import { Network } from "@dcl/schemas";
import {
  AuthorizationFlowRequestAction,
  FetchAuthorizationsRequestAction,
  fetchAuthorizationsRequest,
} from "../../../modules/authorization/actions";
import {
  Authorization,
  AuthorizationType,
} from "../../../modules/authorization/types";
import { RootStateOrAny } from "../../../types";
import { AuthorizationTranslationKeys } from "../withAuthorizedAction.types";

// Action to perform after authorization step is finished
export enum AuthorizedAction {
  BID = "bid",
  BUY = "buy",
  MINT = "mint",
  RENT = "rent",
  CLAIM_NAME = "claim_name",
  SWAP_MANA = "swap_mana",
  SELL = "sell",
  PUBLISH_COLLECTION = "publish_collection",
}

export enum AuthorizationStepStatus {
  LOADING_INFO = "loading_info",
  PENDING = "pending",
  WAITING = "waiting",
  PROCESSING = "processing",
  ALLOWANCE_AMOUNT_ERROR = "allowance_amount_error",
  ERROR = "error",
  DONE = "done",
}

export enum AuthorizationStepAction {
  REVOKE = "revoke",
  GRANT = "grant",
  CONFIRM = "confirm",
}

export type HandleGrantOptions = {
  requiredAllowance?: BigNumber;
  currentAllowance?: BigNumber;
  onAuthorized?: () => void;
  traceId?: string;
};

export type Props = {
  authorization: Authorization;
  isWeb2AutoSigning?: boolean;
  requiredAllowance?: BigNumber;
  currentAllowance?: BigNumber;
  action: AuthorizedAction;
  authorizationType: AuthorizationType;
  confirmationStatus: AuthorizationStepStatus;
  grantStatus: AuthorizationStepStatus;
  revokeStatus: AuthorizationStepStatus;
  error: string;
  confirmationError: string | null;
  network: Network;
  authorizedContractLabel?: string;
  targetContractLabel?: string;
  translationKeys: AuthorizationTranslationKeys;
  getConfirmationStatus?: (state: RootStateOrAny) => AuthorizationStepStatus;
  getConfirmationError?: (state: RootStateOrAny) => string | null;
  onClose: () => void;
  onAuthorized: () => void;
  onFetchAuthorizations: () => ReturnType<typeof fetchAuthorizationsRequest>;
  onRevoke: (authorization: Authorization, analyticsTraceId: string) => void;
  onGrant: (authorization: Authorization, options?: HandleGrantOptions) => void;
};

export type MapDispatchProps = Pick<Props, "onFetchAuthorizations">;
export type MapDispatch = Dispatch<
  AuthorizationFlowRequestAction | FetchAuthorizationsRequestAction
>;
export type OwnProps = Pick<
  Props,
  | "isWeb2AutoSigning"
  | "authorization"
  | "requiredAllowance"
  | "getConfirmationStatus"
  | "getConfirmationError"
  | "translationKeys"
  | "targetContractLabel"
  | "authorizedContractLabel"
  | "currentAllowance"
  | "authorizationType"
  | "action"
  | "network"
  | "onAuthorized"
  | "onGrant"
  | "onRevoke"
>;
export type MapStateProps = Pick<
  Props,
  | "revokeStatus"
  | "grantStatus"
  | "error"
  | "confirmationStatus"
  | "confirmationError"
>;
