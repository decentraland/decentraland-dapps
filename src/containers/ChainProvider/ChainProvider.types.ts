import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'

export type ChainData = {
  chainId: ChainId | null
  network: Network | null
  isConnected: boolean
  isSupported: boolean
  isPartiallySupported: boolean
  isUnsupported: boolean
}

export type Props = ChainData & {
  children: (data: ChainData) => React.ReactNode
}

export type MapStateProps = Pick<
  Props,
  | 'chainId'
  | 'network'
  | 'isConnected'
  | 'isSupported'
  | 'isPartiallySupported'
  | 'isUnsupported'
>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
