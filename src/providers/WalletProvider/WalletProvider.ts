import * as React from 'react'
import {
  isApprovableWallet,
  isWalletApproved
} from '../../modules/wallet/utils'
import { DefaultProps, Props } from './WalletProvider.types'

export default class WalletProvider extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    children: null
  }

  async componentWillMount() {
    const { onConnect } = this.props

    if (await this.shouldConnect()) {
      onConnect()
    }
  }

  async shouldConnect() {
    return (
      !isApprovableWallet() ||
      (isApprovableWallet() && (await isWalletApproved()))
    )
  }

  render() {
    const { children } = this.props
    return children
  }
}
