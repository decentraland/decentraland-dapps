import React from 'react'
import { getConnectedProvider } from '../../lib/eth'
import { buildWallet } from '../../modules/wallet/utils'
import {
  Props,
  EventType,
  Handler,
  EmitterMethod,
  AccountsChangedHandler,
  NetworkChangedHandler
} from './WalletProvider.types'

export default class WalletProvider extends React.PureComponent<Props> {
  handleChangeAccount = async () => {
    const { isConnected, isConnecting, address, onChangeAccount } = this.props
    try {
      const wallet = await buildWallet()
      if (isConnected && !isConnecting && wallet.address !== address) {
        onChangeAccount(wallet)
      }
    } catch (error) {
      // do nothing
    }
  }

  handleChangeNetwork = async () => {
    const { isConnected, isConnecting, chainId, onChangeNetwork } = this.props
    try {
      const wallet = await buildWallet()
      if (isConnected && !isConnecting && wallet.chainId !== chainId) {
        onChangeNetwork(wallet)
      }
    } catch (error) {
      // do nothing
    }
  }

  async handle(method: EmitterMethod, type: EventType, handler: Handler) {
    // try to use ethers abstraction
    const provider = await getConnectedProvider()
    if (provider) {
      try {
        switch (type) {
          case 'accountsChanged':
            provider[method](type, handler as AccountsChangedHandler)
            break
          case 'chainChanged':
            provider[method](type, handler as NetworkChangedHandler)
            break
          default:
            // do nothing
            break
        }
        return // all good, early return
      } catch (error) {
        // it fails if there's legacy provider (ie. metamask legacy provider) but it shouldn't happen
      }
    }
  }

  on(type: EventType, handler: Handler) {
    this.handle('on', type, handler).catch(error =>
      console.error(error.message)
    )
  }

  off(type: EventType, handler: Handler) {
    this.handle('removeListener', type, handler).catch(error =>
      console.error(error.message)
    )
  }

  componentDidMount() {
    // try to connect wallet
    const { onConnect } = this.props
    onConnect()

    // add listeners
    this.on('accountsChanged', this.handleChangeAccount)
    this.on('chainChanged', this.handleChangeNetwork)
  }

  componentWillUnmount() {
    // remove listeners
    this.off('accountsChanged', this.handleChangeAccount)
    this.off('chainChanged', this.handleChangeNetwork)
  }

  render() {
    const { children } = this.props
    return children
  }
}
