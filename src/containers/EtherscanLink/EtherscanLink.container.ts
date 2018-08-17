import { connect } from 'react-redux'
import { getNetwork } from '../../modules/wallet/selectors'
import EtherscanLink from './EtherscanLink'
import { MapStateProps, MapDispatchProps } from './EtherscanLink.types'

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
