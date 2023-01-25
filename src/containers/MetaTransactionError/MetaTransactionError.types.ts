import React from 'react'
import { Dispatch } from 'redux'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'

export type Props = {
  text: React.ReactNode
  learnMoreLink?: string
  onSwitchNetwork: (chainId: ChainId) => void
}

export type MapDispatchProps = Pick<Props, 'onSwitchNetwork'>
export type MapDispatch = Dispatch
