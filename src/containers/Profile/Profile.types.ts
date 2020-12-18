import { ProfileProps } from 'decentraland-ui'
import {
  loadProfileRequest,
  LoadProfileRequestAction
} from '../../modules/profile/actions'
import { Dispatch } from 'redux'

export type Props = ProfileProps & {
  onLoadProfile: typeof loadProfileRequest
}

export type MapStateProps = Pick<Props, 'avatar'>
export type MapDispatchProps = Pick<Props, 'onLoadProfile'>
export type MapDispatch = Dispatch<LoadProfileRequestAction>
export type OwnProps = Pick<Props, 'address'>
