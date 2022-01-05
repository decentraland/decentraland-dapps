import { takeLatest, put, call, takeEvery } from 'redux-saga/effects'
import { Avatar } from 'decentraland-ui/dist/types/avatar'
import { Entity, EntityType } from 'dcl-catalyst-commons/dist/types'
import { PeerAPI } from '../../lib/peer'
import { EntitesOperator } from '../../lib/entities'
import { ProfileEntity } from '../../lib/types'
import {
  ConnectWalletSuccessAction,
  CONNECT_WALLET_SUCCESS,
  CHANGE_ACCOUNT,
  ChangeAccountAction
} from '../wallet/actions'
import {
  LOAD_PROFILE_REQUEST,
  LoadProfileRequestAction,
  loadProfileSuccess,
  loadProfileFailure,
  loadProfileRequest,
  SetProfileAvatarDescriptionRequestAction,
  setProfileAvatarDescriptionSuccess,
  setProfileAvatarDescriptionFailure,
  SET_PROFILE_AVATAR_DESCRIPTION_REQUEST
} from './actions'
import { Profile } from './types'

type CreateProfileSagaOptions = {
  peerUrl: string
}

export function createProfileSaga({ peerUrl }: CreateProfileSagaOptions) {
  const peerApi = new PeerAPI(peerUrl)
  const entities = new EntitesOperator(peerUrl)

  function* profileSaga() {
    yield takeEvery(LOAD_PROFILE_REQUEST, handleLoadProfileRequest)
    yield takeEvery(
      SET_PROFILE_AVATAR_DESCRIPTION_REQUEST,
      handleSetProfileDescription
    )
    yield takeLatest(CONNECT_WALLET_SUCCESS, handleWallet)
    yield takeLatest(CHANGE_ACCOUNT, handleWallet)
  }

  function* handleLoadProfileRequest(action: LoadProfileRequestAction) {
    const { address } = action.payload
    try {
      const profile: Profile = yield call([peerApi, 'fetchProfile'], address)
      yield put(loadProfileSuccess(address, profile))
    } catch (error) {
      yield put(loadProfileFailure(address, error.message))
    }
  }

  function* handleWallet(
    action: ConnectWalletSuccessAction | ChangeAccountAction
  ) {
    yield put(loadProfileRequest(action.payload.wallet.address))
  }

  /**
   * Handles the action to set the description of a user's profile.
   * This handler gets the first profile entity of a given address
   * and then rebuilds it with the specified description to deploy it
   * again.
   *
   * @param action - The action that triggered the handler.
   */
  function* handleSetProfileDescription(
    action: SetProfileAvatarDescriptionRequestAction
  ) {
    try {
      const { address, description } = action.payload

      const entity: ProfileEntity = yield call(
        [entities, 'getProfileEntity'],
        address
      )

      // Does a profile always have an avatar?
      const newAvatar: Avatar = {
        ...entity.metadata.avatars[0],
        version: entity.metadata.avatars[0].version + 1,
        description: description
      }

      const newEntity: Entity = {
        ...entity,
        metadata: {
          ...entity.metadata,
          avatars: [newAvatar, ...entity.metadata.avatars.slice(1)]
        }
      }
      yield call(
        [entities, 'deployEntityWithoutNewFiles'],
        newEntity,
        EntityType.PROFILE,
        action.payload.address
      )

      yield put(
        setProfileAvatarDescriptionSuccess(
          action.payload.address,
          newAvatar.description,
          newAvatar.version
        )
      )
    } catch (error) {
      yield put(
        setProfileAvatarDescriptionFailure(
          action.payload.address,
          error.message
        )
      )
    }
  }

  return profileSaga
}
