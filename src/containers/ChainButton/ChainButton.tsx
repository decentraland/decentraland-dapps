import React from 'react'
import { Button as ButtonComponent, Popup } from 'decentraland-ui'
import { T } from '../../modules/translation/utils'
import { getConnectedProviderChainId } from '../../lib/eth'
import { ChainButtonProps } from './ChainButton.types'
import { getChainName } from '@dcl/schemas'

export default class Button extends React.PureComponent<ChainButtonProps> {
  render() {
    const { chainId, connectedChainId, onClick, ...rest } = this.props
    const expectedChainId = getConnectedProviderChainId()
    const isSupportedNetwork =
      chainId === connectedChainId || connectedChainId === expectedChainId
    const props = isSupportedNetwork
      ? { onClick }
      : { style: { opacity: 0.5, cursor: 'not-allowed', transform: 'none' } }
    return (
      <Popup
        disabled={isSupportedNetwork}
        position="top center"
        content={
          <T
            id="@dapps.button.network_not_supported"
            values={{
              expectedChainName: <b>{getChainName(expectedChainId!)}</b>
            }}
          />
        }
        trigger={<ButtonComponent {...rest} {...props} />}
      />
    )
  }
}
