import * as React from 'react'
import { WalletProviderProps } from './types'

export default class Wallet extends React.PureComponent<WalletProviderProps> {
  static defaultProps = {
    children: null
  }

  componentWillMount() {
    const { onConnect } = this.props
    onConnect()
  }

  render() {
    const { children } = this.props
    return children
  }
}
