import { Options, WidgetEvents } from "@wert-io/widget-initializer/types";
import { Network } from "@dcl/schemas/dist/dapps/network";
import { NetworkGatewayType } from "decentraland-ui/dist/components/BuyManaWithFiatModal/Network";
import { TradeType } from "./transak/types";

export enum FiatGateway {
  WERT = "wert",
}

export enum WertTarget {
  DEFAULT = "default",
  PUBLICATION_FEES = "publicationFees",
}

export type WertOptions = Options & { target?: WertTarget };

export type FiatGatewayOptions = WertOptions; // will be adding more options as we add more providers

export type FiatGatewayOnPendingListener = (event: WidgetEvents) => void;
export type FiatGatewayOnSuccessListener = (event: WidgetEvents) => void;
export type FiatGatewayOnLoadedListener = () => void;
export type FiatGatewayOnCloseListener = () => void;

export type FiatGatewayListeners = {
  onLoaded?: FiatGatewayOnLoadedListener;
  onPending?: FiatGatewayOnPendingListener;
  onSuccess?: FiatGatewayOnSuccessListener;
  onClose?: FiatGatewayOnCloseListener;
};

export type WertMessage = {
  address: string;
  commodity: string;
  commodity_amount: number;
  network: string;
  sc_address: string;
  sc_input_data: string;
};

type Commodity = {
  commodity: string;
  network: string;
};

type Wallet = {
  name: string;
  network: string;
  address: string;
};

type Extra = {
  wallets: Wallet[];
};

export type WertSession = {
  // Required parameters
  flow_type: "simple" | "simple_full_restrict";

  // Optional parameters
  phone?: string; // User's phone number in international format (E. 164 standard). The '+' is optional.
  userID?: string; // The User ID for the associated profile

  // Parameters required for simple_full_restrict flow
  commodity?: string; // Default crypto asset that will be selected in the module
  network?: string; // Network for the default crypto asset
  wallet_address?: string; // User's wallet address. It is validated based on the chosen commodity
  commodity_amount?: number; // The default crypto amount that will be pre-filled in the module
  currency?: "USD" | "EUR"; // Your choice of fiat currency. EUR is not available in sandbox environment
  currency_amount?: number; // The default amount, in fiat, which will be pre-filled in the module

  // Optional parameters
  commodities?: Commodity[]; // Crypto assets that will be available in the module as a stringified JSON of an array of objects
  extra?: Extra; // Passing multiple wallet addresses to the widget
};

export type WertPayload = {
  message: WertMessage;
  session: WertSession;
  target?: WertTarget;
};

export type WertConfig = {
  url: string;
  marketplaceServerURL: string;
};

export type MoonPayConfig = {
  apiBaseUrl: string;
  apiKey: string;
  pollingDelay?: number;
  widgetBaseUrl: string;
};

export type TransakConfig = {
  apiBaseUrl: string;
  pollingDelay?: number;
  pusher: {
    appKey: string;
    appCluster: string;
  };
};

export type ManaFiatGatewaySagasConfig = {
  [NetworkGatewayType.MOON_PAY]?: MoonPayConfig;
  [NetworkGatewayType.TRANSAK]?: TransakConfig;
};

export type FiatGatewaySagasConfig = {
  [FiatGateway.WERT]?: WertConfig;
};

export type GatewaySagasConfig = FiatGatewaySagasConfig &
  ManaFiatGatewaySagasConfig;

export enum PurchaseStatus {
  PENDING = "pending",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  COMPLETE = "complete",
}

type BasePurchase = {
  id: string;
  network: Network;
  gateway: NetworkGatewayType;
  timestamp: number;
  status: PurchaseStatus;
  paymentMethod: string;
  address: string;
  txHash: string | null;
  failureReason?: string | null;
};

export type ManaPurchase = BasePurchase & { amount: number };

export type NFTPurchase = BasePurchase & {
  nft: {
    contractAddress: string;
    tokenId?: string;
    itemId?: string;
    tradeType: TradeType;
    cryptoAmount: number;
  };
};

export type Purchase = ManaPurchase | NFTPurchase;
