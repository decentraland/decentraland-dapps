import { connect } from 'react-redux'
import { ProviderType } from 'decentraland-connect'
import { getChainId } from '../../modules/wallet/selectors'
import { getChainConfiguration } from '../../lib/chainConfiguration'
import {
  getConnectedProviderChainId,
  getConnectedProviderType
} from '../../lib/eth'
import {
  MapStateProps,
  MapDispatchProps,
  MapDispatch
} from './ChainProvider.types'
import ChainProvider from './ChainProvider'

const mapState = (state: any): MapStateProps => {
  const chainId = getChainId(state) || null
  const network = chainId && getChainConfiguration(chainId).network
  const expectedChainId = getConnectedProviderChainId()
  const providerType = getConnectedProviderType()
  const config = expectedChainId && getChainConfiguration(expectedChainId)
  const isConnected = !!chainId && !!config
  const isSupported = isConnected && chainId === expectedChainId
  const isPartiallySupported =
    isConnected &&
    !isSupported &&
    providerType !== ProviderType.WALLET_CONNECT &&
    Object.values(config!.networkMapping).some(
      mappedChainId => mappedChainId === chainId
    )
  const isUnsupported = isConnected && !isSupported && !isPartiallySupported
  return {
    chainId,
    network,
    isConnected,
    isSupported,
    isPartiallySupported,
    isUnsupported
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(ChainProvider)
