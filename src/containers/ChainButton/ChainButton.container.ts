import { connect } from 'react-redux'
import { getChainId } from '../../modules/wallet/selectors'
import {
  MapStateProps,
  MapDispatchProps,
  MapDispatch
} from './ChainButton.types'
import Button from './ChainButton'

const mapState = (state: any): MapStateProps => ({
  connectedChainId: getChainId(state)
})

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(Button)
