import { connect } from 'react-redux'
import { getChainId } from '../../modules/wallet/selectors'
import { MapStateProps, MapDispatchProps } from './EtherscanLink.types'
import EtherscanLink from './EtherscanLink'

const mapState = (state: any): MapStateProps => ({
  chainId: getChainId(state)
})

const mapDispatch = (_: any): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(EtherscanLink)
