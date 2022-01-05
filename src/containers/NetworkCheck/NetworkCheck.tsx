import React from 'react'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import { T } from '../../modules/translation/utils'
import { getChainIdByNetwork, getConnectedProviderChainId } from '../../lib/eth'
import { Props } from './NetworkCheck.types'
import { getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import ChainProvider from '../ChainProvider'

export default class ChainCheck extends React.PureComponent<Props> {
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
          const isEnabled = data.isSupported || data.chainId === this.getChainId()
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
