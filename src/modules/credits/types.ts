export type Credit = {
  amount: string;
  availableAmount: string;
  contract: string;
  expiresAt: string;
  id: string;
  season: number;
  signature: string;
  timestamp: string;
  userAddress: string;
};

export type CreditsResponse = {
  credits: Credit[];
  totalCredits: number;
};

export interface SeasonResponse {
  id: number;
  week: number;
  isPaused: boolean;
}

export interface CreditsNameRouteExternalCall {
  target: string;
  selector: string;
  data: string;
  expiresAt: number;
  salt: string;
}

export interface CreditsNameRouteResponse {
  externalCall: CreditsNameRouteExternalCall;
  customExternalCallSignature: string;
  quoteId: string;
  estimatedRouteDuration: number;
  fromChainId: string;
  toChainId: string;
}
