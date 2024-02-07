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
  console.log('chainId: ', chainId)
  const chainName = chainId ? getChainName(chainId) : null
  console.log('chainName: ', chainName)
  const network = chainId && getChainConfiguration(chainId).network
  console.log('network: ', network)
  const appChainId = getAppChainId(state)
  console.log('appChainId: ', appChainId)
  const appConfig = getChainConfiguration(appChainId)
  console.log('appConfig: ', appConfig)
  const appChainName = getChainName(appChainId)!
  console.log('appChainName: ', appChainName)
  const appNetwork = appConfig.network
  console.log('appNetwork: ', appNetwork)
  const isConnected = !!chainId && !!appConfig
  console.log('isConnected: ', isConnected)
  const isSupported =
    isConnected && Object.values(appConfig.networkMapping).includes(chainId)
  // const isSupported = isConnected && chainId === appChainId
  // console.log('isSupported: ', isSupported)
  // const isPartiallySupported =
  //   isConnected &&
  //   !isSupported &&
  //   Object.values(appConfig.networkMapping).some(
  //     mappedChainId => mappedChainId === chainId
  //   )
  // console.log('isPartiallySupported: ', isPartiallySupported)
  const isUnsupported = isConnected && !isSupported
  // const isUnsupported = isConnected && !isSupported && !isPartiallySupported
  console.log('isUnsupported: ', isUnsupported)
  return {
    chainId,
    chainName,
    network,
    appChainId,
    appChainName,
    appNetwork,
    isConnected,
    isSupported,
    // isPartiallySupported,
    isUnsupported
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(ChainProvider)
