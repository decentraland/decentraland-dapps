import * as React from 'react'
import { getTransactionHref } from '../../modules/transaction/utils'
import { Props, DefaultProps } from './TransactionLink.types'

export default class TransactionLink extends React.PureComponent<Props> {
  static defaultProps: DefaultProps = {
    className: 'etherscan-link',
    target: '_blank',
    text: ''
  }

  render() {
    const { address, txHash } = this.props

    if (!address && !txHash) {
      console.warn(
        'Tried to render an TransactionLink without either an address or tx hash. Please supply one of those'
      )
      return null
    }

    const { chainId, className, target, text, children } = this.props

    const href = getTransactionHref({ address, txHash }, chainId)

    return (
      <a className={className} href={href} target={target}>
        {children || text || href}
      </a>
    )
  }
}
