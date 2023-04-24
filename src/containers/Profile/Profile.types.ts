import { Dispatch } from 'redux'
import { ProfileProps } from 'decentraland-ui/dist/components/Profile/Profile'
import React from 'react'
import {
  loadProfileRequest,
  LoadProfileRequestAction
} from '../../modules/profile/actions'

export type Props<T extends React.ElementType = typeof React.Fragment> = Omit<
  ProfileProps<T>,
  'as'
> & {
  debounce?: number
  onLoadProfile: typeof loadProfileRequest
}

export type MapStateProps = Pick<Props, 'avatar'>
export type MapDispatchProps = Pick<Props, 'onLoadProfile'>
export type MapDispatch = Dispatch<LoadProfileRequestAction>
export type OwnProps = Pick<Props, 'address'>
