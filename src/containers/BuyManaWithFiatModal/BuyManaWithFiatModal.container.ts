import { connect } from 'react-redux'
import { Network } from '@dcl/schemas/dist/dapps/network'
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
  MapDispatchProps
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

export default connect(mapState, mapDispatch)(BuyManaWithFiatModal)
