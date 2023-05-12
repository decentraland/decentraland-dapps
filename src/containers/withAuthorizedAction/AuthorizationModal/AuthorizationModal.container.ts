import { RootStateOrAny, connect } from 'react-redux'
import {
  authorizationFlowRequest,
  fetchAuthorizationsRequest
} from '../../../modules/authorization/actions'
import { AuthorizationAction } from '../../../modules/authorization/types'
import {
  getAuthorizationFlowError,
  getError
} from '../../../modules/authorization/selectors'
import { AuthorizationModal } from './AuthorizationModal'
import {
  AuthorizationStepStatus,
  MapDispatch,
  MapDispatchProps,
  MapStateProps,
  OwnProps
} from './AuthorizationModal.types'
import { getStepStatus } from './utils'

const mapState = (state: RootStateOrAny, ownProps: OwnProps): MapStateProps => {
  const {
    authorization,
    requiredAllowance,
    getConfirmationStatus,
    getConfirmationError
  } = ownProps
  return {
    revokeStatus: getStepStatus(
      state,
      AuthorizationAction.REVOKE,
      authorization,
      undefined
    ),
    grantStatus: getStepStatus(
      state,
      AuthorizationAction.GRANT,
      authorization,
      requiredAllowance
    ),
    confirmationStatus: getConfirmationStatus
      ? getConfirmationStatus(state)
      : AuthorizationStepStatus.PENDING,
    confirmationError: getConfirmationError
      ? getConfirmationError(state)
      : null,
    error: getAuthorizationFlowError(state) || getError(state) || ''
  }
}

const mapDispatch = (
  dispatch: MapDispatch,
  ownProps: OwnProps
): MapDispatchProps => ({
  onRevoke: () =>
    dispatch(
      authorizationFlowRequest(
        ownProps.authorization,
        AuthorizationAction.REVOKE,
        ''
      )
    ),
  onGrant: () =>
    dispatch(
      authorizationFlowRequest(
        ownProps.authorization,
        AuthorizationAction.GRANT,
        ownProps.requiredAllowance?.toString() || ''
      )
    ),
  onFetchAuthorizations: () =>
    dispatch(fetchAuthorizationsRequest([ownProps.authorization]))
})

export default connect(mapState, mapDispatch)(AuthorizationModal)
