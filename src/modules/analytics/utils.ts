import { isbot } from 'isbot'
import { AnyAction } from 'redux'
import { Wallet } from '../wallet/types'
import {
  ActionType,
  AnalyticsAction,
  AnalyticsWindow,
  AnalyticsWithMiddleware,
  EventName,
  GetPayload,
  MiddlewareFunction,
  TransformPayload,
  WindowWithWallets
} from './types'

export const trackedActions: { [key: string]: AnalyticsAction } = {}

let transformPayload: TransformPayload | null = null

export function add(actionType: ActionType, eventName?: EventName, getPayload?: GetPayload) {
  if (actionType in trackedActions) {
    console.warn(`Analytics: the action type "${actionType}" is already being tracked!`)
    return
  }
  trackedActions[actionType] = { actionType, eventName, getPayload }
}

export function track(action: AnyAction) {
  const analytics = getAnalytics()
  if (!analytics) return

  if (isTrackable(action)) {
    const { eventName, getPayload } = trackedActions[action.type]

    let event = action.type
    if (eventName) {
      if (typeof eventName === 'string') {
        event = eventName
      } else {
        event = eventName(action)
      }
    }

    let payload
    if (getPayload) {
      payload = getPayload(action)
    }

    analytics.track(event, transformPayload ? transformPayload(payload) : payload)
  }
}

export function isTrackable(action: AnyAction) {
  if (action && action.type) {
    return action.type in trackedActions
  }
  console.warn(`Analytics: invalid action "${JSON.stringify(action)}"`)
  return false
}

export function getAnalytics() {
  if (typeof window === 'undefined' || !window.analytics) return

  const userAgent = window.navigator.userAgent

  const isBot = isbot(userAgent)
  if (isBot) {
    return undefined
  }

  registerWalletMiddleware()
  return (window as AnalyticsWindow).analytics
}

export function configure(params: { transformPayload?: TransformPayload }) {
  if (params.transformPayload) {
    transformPayload = params.transformPayload
  }
}

/**
 * Useful function for when you are not integrating the analytics module into your project
 * and want to manually track this event the same way as if the saga was integrated.
 */
export function trackConnectWallet(
  props: Pick<Wallet, 'address' | 'providerType' | 'chainId'> & {
    // The name of the wallet used to connect. Not to be confused with the providerType.
    // This would be, for example, "Trust Wallet" when connecting via WalletConnect.
    walletName?: string
  }
) {
  const analytics = getAnalytics()

  if (analytics) {
    analytics.track('Connect Wallet', props)
  }
}

export function getAnonymousId() {
  const analytics = getAnalytics()
  if (analytics) {
    return analytics.user().anonymousId()
  } else {
    return undefined
  }
}

export function hasEvmWallet() {
  const userAgent = window.navigator.userAgent

  const isBot = isbot(userAgent)
  if (isBot) {
    return undefined
  }

  return (window as any).ethereum !== undefined
}

export function getEvmWallets() {
  const userAgent = window.navigator.userAgent

  const isBot = isbot(userAgent)
  if (isBot) {
    return undefined
  }
  const windowWallets = window as WindowWithWallets
  const ethereum = windowWallets.ethereum
  if (!ethereum) return []

  const names = new Set<string>()

  if (ethereum.isRabby) names.add('rabby')
  else if (ethereum.isMetaMask) names.add('metamask')
  if (ethereum.isCoinbaseWallet) names.add('coinbase')

  return Array.from(names)
}

export function hasSolanaWallet() {
  const userAgent = window.navigator.userAgent

  const isBot = isbot(userAgent)
  if (isBot) {
    return undefined
  }

  const windowWallets = window as WindowWithWallets
  const solanaWallets = getSolanaWallets()
  return windowWallets.solana !== undefined || (solanaWallets !== undefined && solanaWallets.length > 0)
}

export function getSolanaWallets() {
  const userAgent = window.navigator.userAgent

  const isBot = isbot(userAgent)
  if (isBot) {
    return undefined
  }

  const windowWallets = window as WindowWithWallets
  const names = new Set<string>()

  if (windowWallets.sollet !== undefined) names.add('sollet')
  if (windowWallets.braveSolana?.isBraveWallet === true) names.add('brave')
  if (windowWallets.solong !== undefined) names.add('solong')
  if (windowWallets.exodus?.solana !== undefined) names.add('exodus')
  if (windowWallets.glowSolana) names.add('glow')
  if (windowWallets.solana?.isPhantom === true) names.add('phantom')
  if (windowWallets.solana?.isMathWallet === true) names.add('mathwallet')
  if (windowWallets.coin98 !== undefined) names.add('coin98')
  if (windowWallets.coinbaseSolana !== undefined) names.add('coinbase')
  if (windowWallets.clover_solana !== undefined) names.add('clover')
  if (windowWallets.Slope !== undefined) names.add('slope')
  if (windowWallets.huobiWallet?.isHuobiWallet === true) names.add('huobi')
  if (typeof windowWallets?.nightly?.solana !== 'undefined') names.add('nightly')

  return Array.from(names)
}

export function getAllWallets() {
  const evmWallets = getEvmWallets()
  const solanaWallets = getSolanaWallets()
  return [...(evmWallets ?? []), ...(solanaWallets ?? [])]
}

const createWalletEnrichmentMiddleware = (): MiddlewareFunction => {
  return ({ payload, next }) => {
    const walletContext = {
      hasEvmWallet: hasEvmWallet(),
      hasSolanaWallet: hasSolanaWallet(),
      userWallets: getAllWallets()
    }

    payload.obj.context = {
      ...payload.obj.context,
      ...walletContext
    }

    next(payload)
  }
}

// Global flag to ensure middleware is only registered once
let globalMiddlewareRegistered = false

// Export for testing purposes only
export const resetMiddlewareRegistration = () => {
  globalMiddlewareRegistered = false
}

const registerWalletMiddleware = () => {
  if (typeof window === 'undefined' || !window.analytics) return

  if (globalMiddlewareRegistered) return

  const analytics = window.analytics as AnalyticsWithMiddleware

  if (analytics._walletMiddlewareRegistered) return

  if (typeof analytics.addSourceMiddleware === 'function') {
    analytics.addSourceMiddleware(createWalletEnrichmentMiddleware())
  } else {
    console.warn('Segment middleware not supported in this version')
    return
  }

  // Mark as registered both globally and on analytics object
  globalMiddlewareRegistered = true
  analytics._walletMiddlewareRegistered = true
}
