import { ChainId } from '@dcl/schemas'

export type DefaultProps = {
  className: string
  target: string
  text: string
}

export type Props = Partial<DefaultProps> & {
  address: string
  txHash: string
  chainId?: ChainId
}

export type MapStateProps = Pick<Props, 'chainId'>
export type MapDispatchProps = {}
