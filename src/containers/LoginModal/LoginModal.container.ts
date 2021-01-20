import { connect } from 'react-redux'
import {
  getError,
  isEnabling,
  isConnected
} from '../../modules/wallet/selectors'
import { enableWalletRequest } from '../../modules/wallet/actions'
import {
  MapStateProps,
  MapDispatch,
  MapDispatchProps
} from './LoginModal.types'
import LoginModal from './LoginModal'

const mapState = (state: any): MapStateProps => ({
  hasError: !!getError(state),
  isLoading: isEnabling(state) || isConnected(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: providerType => dispatch(enableWalletRequest(providerType))
})

export default connect(
  mapState,
  mapDispatch
)(LoginModal)
