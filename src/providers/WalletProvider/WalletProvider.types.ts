import { connectWalletRequest } from '../../modules/wallet/actions'

export interface DefaultProps {
  children: React.ReactNode | null
}

export interface Props extends DefaultProps {
  onConnect: typeof connectWalletRequest
}

export type MapStateProps = {}
export type MapDispatchProps = Pick<Props, 'onConnect'>

