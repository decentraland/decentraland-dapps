import { contracts } from 'decentraland-eth'
import { ActionType } from 'typesafe-actions'
import { LoadingState } from '../loading/types'
import * as actions from './actions'

// Action Types

export const CONNECT_WALLET_REQUEST = '[Request] Connect Wallet'
export const CONNECT_WALLET_SUCCESS = '[Success] Connect Wallet'
export const CONNECT_WALLET_FAILURE = '[Failure] Connect Wallet'

export const COMPUTE_BALANCES_REQUEST = '[Request] Compute Wallet Balances'
export const COMPUTE_BALANCES_SUCCESS = '[Success] Compute Wallet Balances'
export const COMPUTE_BALANCES_FAILURE = '[Failure] Compute Wallet Balances'

// Interface and type definitions

export type ConnectWalletSuccess = ReturnType<
  typeof actions.connectWalletSuccess
>

export type WalletActions = ActionType<typeof actions>

export type BigNumber = {
  toString(): string
  toNumber(): number
}
export interface ERC20Token extends contracts.ERC20Token {
  balanceOf(address: string): Promise<BigNumber>
  decimals(): Promise<BigNumber>
}

export interface BaseWallet {
  type: string
  network: string
  address: string
  locale?: string
  derivationPath?: string
}

export type WalletState = {
  data: Partial<BaseWallet>
  loading: LoadingState
  error: string | null
}
