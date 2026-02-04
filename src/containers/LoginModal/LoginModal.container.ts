import { connect } from 'react-redux'
import { LoginModalProps } from 'decentraland-ui/dist/components/LoginModal/LoginModal'
import { isEnabled } from '../../modules/translation/selectors'
import { enableWalletRequest } from '../../modules/wallet/actions'
import { getError, isConnecting, isEnabling } from '../../modules/wallet/selectors'
import LoginModal from './LoginModal'
import { MapDispatch, MapDispatchProps, MapStateProps } from './LoginModal.types'

const mapState = (state: any): MapStateProps => ({
  hasError: !!getError(state),
  isLoading: isEnabling(state) || isConnecting(state),
  hasTranslations: isEnabled(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: providerType => dispatch(enableWalletRequest(providerType))
})

const mergeProps = (stateProps: MapStateProps, dispatchProps: MapDispatchProps, ownProps: LoginModalProps): LoginModalProps => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect(mapState, mapDispatch, mergeProps)(LoginModal)
