import { connectWalletRequest } from '../../modules/wallet/actions'

export type DefaultProps = {
  children: React.ReactNode | null
}

export type Props = DefaultProps & {
  onConnect: typeof connectWalletRequest
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onConnect'>
