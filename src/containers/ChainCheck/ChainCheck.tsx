import React from 'react'
import { Popup } from 'decentraland-ui'
import { T } from '../../modules/translation/utils'
import { getConnectedProviderChainId } from '../../lib/eth'
import { Props } from './ChainCheck.types'
import { getChainName } from '@dcl/schemas'
import ChainProvider from '../ChainProvider'

export default class ChainCheck extends React.PureComponent<Props> {
  render() {
    const { chainId, children } = this.props
    return (
      <ChainProvider>
        {data => {
          const isEnabled = data.isSupported || data.chainId === chainId
          return (
            <Popup
              disabled={isEnabled}
              position="top center"
              content={
                <T
                  id="@dapps.button.network_not_supported"
                  values={{
                    expectedChainName: (
                      <b>{getChainName(getConnectedProviderChainId()!)}</b>
                    )
                  }}
                />
              }
              trigger={children(isEnabled)}
            />
          )
        }}
      </ChainProvider>
    )
  }
}
