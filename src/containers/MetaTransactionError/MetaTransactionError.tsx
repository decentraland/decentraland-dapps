import React from 'react'
import { getChainName, Network } from '@dcl/schemas'
import { Button, Row } from 'decentraland-ui'
import { t } from '../../modules/translation/utils'
import { getChainIdByNetwork } from '../../lib/eth'
import { Props } from './MetaTransactionError.types'

export default class MetaTransactionError extends React.PureComponent<Props> {
  render() {
    const { text, onSwitchNetwork, learnMoreLink } = this.props
    const chainId = getChainIdByNetwork(Network.MATIC)
    const network = getChainName(chainId)
    return (
      <div>
        <Row>{text}</Row>
        <br />
        <Row align="right">
          <Button basic onClick={() => onSwitchNetwork(chainId)}>
            {t('@dapps.toasts.switch_network', { network })}
          </Button>
          &nbsp;
          {learnMoreLink ? (
            <Button
              basic
              href={learnMoreLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('@dapps.toasts.learn_more')}
            </Button>
          ) : null}
        </Row>
      </div>
    )
  }
}
