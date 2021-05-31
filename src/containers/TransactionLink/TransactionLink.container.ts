import { connect } from 'react-redux'
import { getChainId } from '../../modules/wallet/selectors'
import {
  MapStateProps,
  MapDispatchProps,
  OwnProps
} from './TransactionLink.types'
import TransactionLink from './TransactionLink'

const mapState = (state: any, ownProps: OwnProps): MapStateProps => ({
  chainId: ownProps.chainId || getChainId(state)
})

const mapDispatch = (_: any): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(TransactionLink)
