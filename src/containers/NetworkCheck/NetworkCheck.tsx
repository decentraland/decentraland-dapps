import React from 'react'
import { getChainName } from '@dcl/schemas'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import { T } from '../../modules/translation/utils'
import { getChainIdByNetwork, getConnectedProviderChainId } from '../../lib/eth'
import ChainProvider from '../ChainProvider'
import { Props } from './NetworkCheck.types'

export default class NetworkCheck extends React.PureComponent<Props> {
  getChainId = () => {
    const { network } = this.props
    try {
      return getChainIdByNetwork(network)
    } catch {
      return null
    }
  }
  render() {
    const { children } = this.props
    return (
      <ChainProvider>
        {data => {
          const isEnabled =
            data.isSupported || data.chainId === this.getChainId()
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
