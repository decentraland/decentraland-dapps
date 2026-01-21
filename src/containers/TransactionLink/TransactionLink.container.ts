import { connect } from "react-redux";
import { getChainId } from "../../modules/wallet/selectors";
import TransactionLink from "./TransactionLink";
import {
  MapDispatchProps,
  MapStateProps,
  OwnProps,
} from "./TransactionLink.types";

const mapState = (state: any, ownProps: OwnProps): MapStateProps => ({
  chainId: ownProps.chainId || getChainId(state),
});

const mapDispatch = (_: any): MapDispatchProps => ({});

export default connect(mapState, mapDispatch)(TransactionLink);
