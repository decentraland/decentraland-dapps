import { ProfileProps } from 'decentraland-ui/dist/components/Profile/Profile'
import {
  loadProfileRequest,
  LoadProfileRequestAction
} from '../../modules/profile/actions'
import { Dispatch } from 'redux'

export type Props = ProfileProps & {
  debounce?: number
  onLoadProfile: typeof loadProfileRequest
}

export type MapStateProps = Pick<Props, 'avatar'>
export type MapDispatchProps = Pick<Props, 'onLoadProfile'>
export type MapDispatch = Dispatch<LoadProfileRequestAction>
export type OwnProps = Pick<Props, 'address'>
