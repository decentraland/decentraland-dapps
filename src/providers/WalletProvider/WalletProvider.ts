import React from 'react'
import { Eth } from 'web3x-es/eth'
import { EthereumProvider } from 'web3x-es/providers/ethereum-provider'
import { getWallet } from '../../modules/wallet/utils'
import {
  Props,
  EventType,
  Handler,
  EmitterMethod,
  AccountsChangedHandler,
  NetworkChangedHandler
} from './WalletProvider.types'
import { getInjectedProvider } from './utils'

export default class WalletProvider extends React.PureComponent<Props> {
  eth = Eth.fromCurrentProvider()

  handleChangeAccount = async () => {
    const { address, onChangeAccount } = this.props
    try {
      const wallet = await getWallet()
      if (wallet.address !== address) {
        onChangeAccount(wallet)
      }
    } catch (error) {
      // do nothing
    }
  }

  handleChangeNetwork = async () => {
    const { network, onChangeNetwork } = this.props
    try {
      const wallet = await getWallet()
      if (wallet.network !== network) {
        onChangeNetwork(wallet)
      }
    } catch (error) {
      // do nothing
    }
  }

  call(
    provider: EthereumProvider,
    method: EmitterMethod,
    type: EventType,
    handler: Handler
  ) {
    switch (type) {
      case 'accountsChanged':
        provider[method](type, handler as AccountsChangedHandler)
        break
      case 'networkChanged':
        provider[method](type, handler as NetworkChangedHandler)
        break
      default:
      // do nothing
    }
  }

  handle(method: EmitterMethod, type: EventType, handler: Handler) {
    // try to use web3x abstraction
    if (this.eth) {
      try {
        this.call(this.eth.provider, method, type, handler)
        return // all good, early return
      } catch (error) {
        // it fails if legacy provider (ie. metamask legacy provider)
      }
    }
    // fallback using web3 (this works with metamask)
    const provider = getInjectedProvider()
    if (provider) {
      try {
        this.call(provider, method, type, handler)
      } catch (error) {
        // it fails if provider is not standard (ie. dapper legacy provider)
        console.warn(
          `Could not use method "${method}" on provider`,
          provider,
          `Error: ${error.message}`
        )
      }
    }
  }

  on(type: EventType, handler: Handler) {
    this.handle('on', type, handler)
  }

  off(type: EventType, handler: Handler) {
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
