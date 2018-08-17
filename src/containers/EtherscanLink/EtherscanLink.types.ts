export type DefaultProps = {
  className: string
  target: string
  text: string
}

export type Props = Partial<DefaultProps> & {
  address: string
  txHash: string
  network: string
}

export type MapStateProps = Pick<Props, 'network'>
export type MapDispatchProps = {}
