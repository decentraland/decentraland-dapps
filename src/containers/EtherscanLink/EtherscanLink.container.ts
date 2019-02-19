import { connect } from 'react-redux'

import EtherscanLink from './EtherscanLink'
import { MapStateProps, MapDispatchProps } from './EtherscanLink.types'
import { getNetwork } from '../../modules/wallet/selectors'

const mapState = (state: any): MapStateProps => {
  return {
    network: getNetwork(state) || ''
  }
}

const mapDispatch = (_: any): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(EtherscanLink) as any
