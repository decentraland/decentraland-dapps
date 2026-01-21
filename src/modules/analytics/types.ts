import { AnyAction } from 'redux'

export type AnalyticsWithMiddleware = SegmentAnalytics.AnalyticsJS & {
  addSourceMiddleware?: (middleware: MiddlewareFunction) => void
  _walletMiddlewareRegistered?: boolean
}
export interface AnalyticsWindow extends Window {
  analytics: AnalyticsWithMiddleware
}

type SegmentPayload = {
  type: 'track' | 'identify' | 'page'
  obj: {
    properties?: Record<string, unknown>
    traits?: Record<string, unknown>
    context?: Record<string, unknown>
  }
}

export type MiddlewareFunction = ({
  payload,
  next,
}: {
  payload: SegmentPayload
  next: (payload: SegmentPayload) => void
}) => void

export type ActionType = AnyAction['type']
export type EventName = string | ((action: AnyAction) => string)
export type GetPayload = (action: AnyAction) => { [key: string]: any } | string
export type TrackPayload = string | undefined | Record<string, any>
export type TransformPayload = (payload: TrackPayload) => TrackPayload

export interface AnalyticsAction {
  actionType: ActionType
  eventName?: EventName
  getPayload?: GetPayload
}

export interface WindowWithWallets extends Window {
  ethereum?: Ethereum & {
    // rabby injected provider: https://rabby.io/docs/integrating-rabby-wallet/
    isRabby?: boolean
    // metamask injected provider: https://docs.metamask.io/wallet/reference/provider-api/#ismetamask
    isMetaMask?: boolean
    // coinbase injected provider: https://docs.cdp.coinbase.com/coinbase-wallet/introduction/coinbase-wallet-injected-ethereum-provider
    isCoinbaseWallet?: boolean
  }
  solana?: {
    isPhantom?: boolean
    isMathWallet?: boolean
  }
  sollet?: any
  braveSolana?: {
    isBraveWallet?: boolean
  }
  solong?: any
  exodus?: {
    solana?: any
  }
  glowSolana?: any
  coin98?: any
  coinbaseSolana?: any
  clover_solana?: any
  Slope?: any
  huobiWallet?: {
    isHuobiWallet?: boolean
  }
  nightly?: {
    solana?: any
  }
}
