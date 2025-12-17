import { connect } from 'react-redux'
import { AuthorizationAction } from '../../../modules/authorization/types'
import {
  getAuthorizationFlowError,
  getError
} from '../../../modules/authorization/selectors'
import { fetchAuthorizationsRequest } from '../../../modules/authorization/actions'
import { AuthorizationModal } from './AuthorizationModal'
import {
  AuthorizationStepStatus,
  MapStateProps,
  OwnProps,
  MapDispatch,
  MapDispatchProps
} from './AuthorizationModal.types'
import { getStepStatus } from './utils'
import { RootStateOrAny } from '../../../types'

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
  onFetchAuthorizations: () =>
    dispatch(fetchAuthorizationsRequest([ownProps.authorization]))
})

export default connect(mapState, mapDispatch)(AuthorizationModal)
