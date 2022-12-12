import { connect } from 'react-redux'
import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { openManaFiatGatewayRequest } from '../../modules/manaFiatGateway/actions'
import {
  getError,
  isFinishingPurchase,
  isOpeningGateway
} from '../../modules/manaFiatGateway/selectors'
import { isEnabled } from '../../modules/translation/selectors'
import {
  MapStateProps,
  MapDispatch,
  MapDispatchProps,
  BuyManaWithFiatModalProps
} from './BuyManaWithFiatModal.types'
import BuyManaWithFiatModal from './BuyManaWithFiatModal'

const mapState = (state: any): MapStateProps => ({
  hasError: !!getError(state),
  isLoading: isOpeningGateway(state) || isFinishingPurchase(state),
  hasTranslations: isEnabled(state)
})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onContinue: (network: Network, gateway: NetworkGatewayType) =>
    dispatch(openManaFiatGatewayRequest(network, gateway))
})

const mergeProps = (
  stateProps: MapStateProps,
  dispatchProps: MapDispatchProps,
  ownProps: BuyManaWithFiatModalProps
): BuyManaWithFiatModalProps => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps
})

export default connect(mapState, mapDispatch, mergeProps)(BuyManaWithFiatModal)
