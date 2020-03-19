import React from 'react'
import { Eth } from 'web3x-es/eth'
import { EthereumProvider } from 'web3x-es/providers/ethereum-provider'
import { getWallet } from '../../modules/wallet/utils'
import { Props } from './WalletProvider.types'

export default class WalletProvider extends React.PureComponent<Props> {
  eth = Eth.fromCurrentProvider()

  handleChangeAccount = async () => {
    const { onChangeAccount } = this.props
    try {
      const wallet = await getWallet()
      onChangeAccount(wallet)
    } catch (error) {
      // nada
    }
  }

  handleChangeNetwork = async () => {
    const { onChangeNetwork } = this.props
    try {
      const wallet = await getWallet()
      onChangeNetwork(wallet)
    } catch (error) {
      // nada
    }
  }

  handle(
    action: 'on' | 'removeListener',
    type: 'accountsChanged' | 'networkChanged',
    handler: Function
  ) {
    // try to use web3x abstraction
    if (this.eth) {
      try {
        this.eth.provider[action](type as any, handler as any)
        return // all good, early return
      } catch (error) {
        // it fails if legacy provider (ie. metamask)
      }
    }
    // fallback using web3 (this works with metamask)
    const provider = (window as any).ethereum as (EthereumProvider | undefined)
    if (provider) {
      provider[action](type as any, handler as any)
    }
  }

  on(type: 'accountsChanged' | 'networkChanged', handler: Function) {
    this.handle('on', type, handler)
  }

  off(type: 'accountsChanged' | 'networkChanged', handler: Function) {
    this.handle('removeListener', type, handler)
  }

  UNSAFE_componentWillMount() {
    // try to connect wallet
    const { onConnect } = this.props
    onConnect()

    // add listeners
    this.on('accountsChanged', this.handleChangeAccount)
    this.on('networkChanged', this.handleChangeNetwork)
  }

  UNSAFE_componentWillUnmount() {
    // remove listeners
    this.off('accountsChanged', this.handleChangeAccount)
    this.off('networkChanged', this.handleChangeNetwork)
  }

  render() {
    const { children } = this.props
    return children
  }
}
