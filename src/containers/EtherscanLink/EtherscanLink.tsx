import * as React from 'react'
import { getEtherscanHref } from '../../modules/transaction/utils'
import { Props, DefaultProps } from './EtherscanLink.types'

export default class EtherscanLink extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    className: 'etherscan-link',
    target: '_blank',
    text: ''
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
