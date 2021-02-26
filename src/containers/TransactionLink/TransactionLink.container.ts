import { connect } from 'react-redux'
import { getChainId } from '../../modules/wallet/selectors'
import { MapStateProps, MapDispatchProps } from './TransactionLink.types'
import TransactionLink from './TransactionLink'

const mapState = (state: any): MapStateProps => ({
  chainId: getChainId(state)
})

const mapDispatch = (_: any): MapDispatchProps => ({})

export default connect(
  mapState,
  mapDispatch
)(TransactionLink)
