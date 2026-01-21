import { connect } from "react-redux";
import { Network } from "@dcl/schemas/dist/dapps/network";
import { NetworkGatewayType } from "decentraland-ui/dist/components/BuyManaWithFiatModal/Network";
import { openManaFiatGatewayRequest } from "../../modules/gateway/actions";
import {
  getError,
  isFinishingPurchase,
  isOpeningGateway,
} from "../../modules/gateway/selectors";
import { isEnabled } from "../../modules/translation/selectors";
import BuyManaWithFiatModal from "./BuyManaWithFiatModal";
import {
  MapDispatch,
  MapDispatchProps,
  MapStateProps,
} from "./BuyManaWithFiatModal.types";

const mapState = (state: any): MapStateProps => ({
  hasError: !!getError(state),
  isLoading: isOpeningGateway(state) || isFinishingPurchase(state),
  hasTranslations: isEnabled(state),
});

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onContinue: (network: Network, gateway: NetworkGatewayType) =>
    dispatch(openManaFiatGatewayRequest(network, gateway)),
});

export default connect(mapState, mapDispatch)(BuyManaWithFiatModal);
