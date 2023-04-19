import { connect } from 'react-redux'
import { LoginModalProps } from 'decentraland-ui/dist/components/LoginModal/LoginModal'
import {
  getError,
  isEnabling,
  isConnecting
} from '../../modules/wallet/selectors'
import { enableWalletRequest } from '../../modules/wallet/actions'
import { isEnabled } from '../../modules/translation/selectors'
import { getIsFeatureEnabled } from '../../modules/features/selectors'
import { ApplicationName, DappsFeatures } from '../../modules/features/types'
import {
  MapStateProps,
  MapDispatch,
  MapDispatchProps
} from './LoginModal.types'
import LoginModal from './LoginModal'

const mapState = (state: any): MapStateProps => ({
  hasError: !!getError(state),
  isLoading: isEnabling(state) || isConnecting(state),
  hasTranslations: isEnabled(state),
  isWalletConnectV2: getIsFeatureEnabled(
    state,
    ApplicationName.DAPPS,
    DappsFeatures.WALLET_CONNECT_V2
  )
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: providerType => dispatch(enableWalletRequest(providerType))
})

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: LoginModalProps
): LoginModalProps => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect(mapState, mapDispatch, mergeProps)(LoginModal)
