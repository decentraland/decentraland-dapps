import { Dispatch } from 'redux'
import { ButtonProps } from 'decentraland-ui'
import { ChainId } from '@dcl/schemas'

export type ChainButtonProps = ButtonProps & {
  chainId?: ChainId
  connectedChainId?: ChainId
}

export type MapStateProps = Pick<ChainButtonProps, 'connectedChainId'>
export type MapDispatchProps = {}
export type MapDispatch = Dispatch
export type OwnProps = Pick<ChainButtonProps, 'chainId'>
