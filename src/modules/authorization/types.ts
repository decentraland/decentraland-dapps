import { ChainId } from "@dcl/schemas/dist/dapps/chain-id";
import { ContractName } from "decentraland-transactions";

export enum AuthorizationType {
  ALLOWANCE = "allowance",
  APPROVAL = "approval",
  MINT = "mint",
}

export enum AuthorizationAction {
  GRANT = "grant",
  REVOKE = "revoke",
}

export type Authorization = {
  type: AuthorizationType;
  address: string;
  contractAddress: string;
  authorizedAddress: string;
  contractName: ContractName;
  chainId: ChainId;
  allowance?: string;
};

export type AuthorizationOptions = {
  /** The minimum allowance amount required for the authorization in wei */
  requiredAllowance?: string;
  /** The current allowance amount that has been already approved in wei */
  currentAllowance?: string;
  /** Callback function to be executed when the authorization is granted */
  onAuthorized?: () => void;
  /** Unique identifier for tracking the authorization process */
  traceId?: string;
};
