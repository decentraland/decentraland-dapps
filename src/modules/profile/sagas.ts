import { takeLatest, put, call, takeEvery, select } from 'redux-saga/effects'
import { Avatar } from 'decentraland-ui'
import { Entity, EntityType } from 'dcl-catalyst-commons'
import {
  ConnectWalletSuccessAction,
  CONNECT_WALLET_SUCCESS,
  CHANGE_ACCOUNT,
  ChangeAccountAction
} from '../wallet/actions'
import { PeerAPI } from '../../lib/peer'
import { EntitesOperations } from '../../lib/entities'
import { ProfileEntity } from '../../lib/types'
import {
  LOAD_PROFILE_REQUEST,
  LoadProfileRequestAction,
  loadProfileSuccess,
  loadProfileFailure,
  loadProfileRequest,
  SetProfileDescriptionRequestAction,
  setProfileDescriptionSuccess,
  setProfileDescriptionFailure,
  SET_PROFILE_DESCRIPTION_REQUEST
} from './actions'
import { Profile } from './types'
import { getProfileOfAddress } from './selectors'

type CreateProfileSagaOptions = {
  peerUrl: string
}

export function createProfileSaga({ peerUrl }: CreateProfileSagaOptions) {
  const peerApi = new PeerAPI(peerUrl)
  const entities = new EntitesOperations(peerUrl)

  function* profileSaga() {
    yield takeEvery(LOAD_PROFILE_REQUEST, handleLoadProfileRequest)
    yield takeEvery(
      SET_PROFILE_DESCRIPTION_REQUEST,
      handleSetProfileDescription
    )
    yield takeLatest(CONNECT_WALLET_SUCCESS, handleWallet)
    yield takeLatest(CHANGE_ACCOUNT, handleWallet)
  }

  function* handleLoadProfileRequest(action: LoadProfileRequestAction) {
    const { address } = action.payload
    try {
      const profile: Profile = yield call(() => peerApi.fetchProfile(address))
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
   *
   * @param {SetProfileDescriptionRequestAction} action - The action that triggered the handler.
   */
  function* handleSetProfileDescription(
    action: SetProfileDescriptionRequestAction
  ) {
    try {
      const { address, description } = action.payload

      const profile: Profile | undefined = yield call(() =>
        select(getProfileOfAddress, address)
      )

      if (!profile) {
        throw new Error(
          "Profile not found while setting its avatar's description"
        )
      }

      const entity: ProfileEntity = yield call(() =>
        entities.getProfileEntity(address)
      )

      // Does a profile always have an avatar?

      const newAvatar: Avatar = {
        ...profile.avatars[0],
        version: profile.avatars[0].version + 1,
        description: description
      }

      // Builds the entity object with the new avatar
      const newEntity: Entity = {
        ...entity,
        metadata: {
          ...entity.metadata,
          avatars: [newAvatar, ...entity.metadata.avatars.slice(1)]
        }
      }

      yield call(() =>
        entities.deployEntity(
          newEntity,
          EntityType.PROFILE,
          action.payload.address
        )
      )

      yield put(
        setProfileDescriptionSuccess(action.payload.address, newEntity.metadata)
      )
    } catch (error) {
      yield put(
        setProfileDescriptionFailure(action.payload.address, error.message)
      )
    }
  }

  return profileSaga
}
