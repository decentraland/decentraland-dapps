import { connect } from 'react-redux'
import { getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { getAppChainId, getChainId } from '../../modules/wallet/selectors'
import { getChainConfiguration } from '../../lib/chainConfiguration'
import {
  MapStateProps,
  MapDispatchProps,
  MapDispatch
} from './ChainProvider.types'
import ChainProvider from './ChainProvider'

const mapState = (state: any): MapStateProps => {
  const chainId = getChainId(state) || null
  const chainName = chainId ? getChainName(chainId) : null
  const network = chainId && getChainConfiguration(chainId).network
  const appChainId = getAppChainId(state)
  const appConfig = getChainConfiguration(appChainId)
  const appChainName = getChainName(appChainId)!
  const appNetwork = appConfig.network
  const isConnected = !!chainId && !!appConfig
  const isSupported =
    isConnected && Object.values(appConfig.networkMapping).includes(chainId)
  const isUnsupported = isConnected && !isSupported
  return {
    chainId,
    chainName,
    network,
    appChainId,
    appChainName,
    appNetwork,
    isConnected,
    isSupported,
    isUnsupported
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(ChainProvider)
