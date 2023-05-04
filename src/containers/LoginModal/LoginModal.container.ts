import { connect } from 'react-redux'
import {
  getError,
  isEnabling,
  isConnecting
} from '../../modules/wallet/selectors'
import { enableWalletRequest } from '../../modules/wallet/actions'
import { isEnabled } from '../../modules/translation/selectors'
import {
  MapStateProps,
  MapDispatch,
  MapDispatchProps,
  OwnProps
} from './LoginModal.types'
import LoginModal from './LoginModal'

const mapState = (state: any): MapStateProps => ({
  hasError: !!getError(state),
  isLoading: isEnabling(state) || isConnecting(state),
  hasTranslations: isEnabled(state)
})

const mapDispatch = (
  dispatch: MapDispatch,
  ownProps: OwnProps
): MapDispatchProps => ({
  onConnect:
    ownProps.metadata?.onConnect ??
    (providerType => dispatch(enableWalletRequest(providerType)))
})

export default connect(mapState, mapDispatch)(LoginModal)
