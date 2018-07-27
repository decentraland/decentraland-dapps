import * as React from 'react'
import { getEtherscanHref } from '../../modules/transaction/utils'
import { EtherscanLinkProps } from './types'

export default class EtherscanLink extends React.PureComponent<
  EtherscanLinkProps
> {
  static propTypes = {}

  static defaultProps = {
    className: 'etherscan-link',
    target: '_blank',
    text: null
  }

  render() {
    const { address, txHash } = this.props

    if (!address && !txHash) {
      console.warn(
        'Tried to render an EtherscanLink without either an address or tx hash. Please supply one of those'
      )
      return null
    }

    const { network, className, target, text, children } = this.props

    const href = getEtherscanHref({ address, txHash }, network)

    return (
      <a className={className} href={href} target={target}>
        {children || text || href}
      </a>
    )
  }
}
