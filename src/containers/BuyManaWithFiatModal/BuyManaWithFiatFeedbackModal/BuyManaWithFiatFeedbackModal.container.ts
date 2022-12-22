import { connect } from 'react-redux'
import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { openManaFiatGatewayRequest } from '../../../modules/manaFiatGateway/actions'
import { openModal } from '../../../modules/modal/actions'
import {
  MapDispatch,
  MapDispatchProps
} from './BuyManaWithFiatFeedbackModal.types'
import RentalModal from './BuyManaWithFiatFeedbackModal'

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onTryAgain: (network: Network, gateway: NetworkGatewayType) =>
    dispatch(openManaFiatGatewayRequest(network, gateway)),
  onSelectOtherProvider: (selectedNetwork: Network) =>
    dispatch(openModal('BuyManaWithFiatModal', { selectedNetwork }))
})

export default connect(null, mapDispatch)(RentalModal)