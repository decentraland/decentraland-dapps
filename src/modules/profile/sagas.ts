import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import { AuthIdentity } from '@dcl/crypto'
import { EntityType } from '@dcl/schemas/dist/platform/entity'
import { Avatar } from '@dcl/schemas/dist/platform/profile'
import { ProfileEntity } from '../../lib'
import { EntitiesOperator } from '../../lib/entities'
import { PeerAPI } from '../../lib/peer'
import {
  CHANGE_ACCOUNT,
  CONNECT_WALLET_SUCCESS,
  ChangeAccountAction,
  ConnectWalletSuccessAction,
} from '../wallet/actions'
import {
  LOAD_PROFILES_REQUEST,
  LOAD_PROFILE_REQUEST,
  LoadProfileRequestAction,
  LoadProfilesRequestAction,
  SET_PROFILE_AVATAR_ALIAS_REQUEST,
  SET_PROFILE_AVATAR_DESCRIPTION_REQUEST,
  SetProfileAvatarAliasRequestAction,
  SetProfileAvatarDescriptionRequestAction,
  loadProfileFailure,
  loadProfileRequest,
  loadProfileSuccess,
  loadProfilesFailure,
  loadProfilesSuccess,
  setProfileAvatarAliasFailure,
  setProfileAvatarAliasSuccess,
  setProfileAvatarDescriptionFailure,
  setProfileAvatarDescriptionSuccess,
} from './actions'
import { Profile } from './types'
import { getHashesByKeyMap } from './utils'

export const NO_IDENTITY_FOUND_ERROR_MESSAGE = 'No identity found'

type CreateProfileSagaOptions = {
  getIdentity: () => AuthIdentity | undefined
  peerUrl: string
  peerWithNoGbCollectorUrl?: string
}

export function createProfileSaga({
  getIdentity,
  peerUrl,
  peerWithNoGbCollectorUrl,
}: CreateProfileSagaOptions) {
  const peerApi = new PeerAPI(peerUrl)
  const entities = new EntitiesOperator(peerUrl, peerWithNoGbCollectorUrl)

  function* profileSaga() {
    yield takeEvery(LOAD_PROFILE_REQUEST, handleLoadProfileRequest)
    yield takeEvery(LOAD_PROFILES_REQUEST, handleLoadProfilesRequest)
    yield takeEvery(
      SET_PROFILE_AVATAR_DESCRIPTION_REQUEST,
      handleSetProfileDescription,
    )
    yield takeEvery(SET_PROFILE_AVATAR_ALIAS_REQUEST, handleSetAlias)
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

  function* handleLoadProfilesRequest(action: LoadProfilesRequestAction) {
    const { addresses } = action.payload
    try {
      const profiles: Profile[] = yield call(
        [peerApi, 'fetchProfiles'],
        addresses,
      )
      yield put(loadProfilesSuccess(profiles))
    } catch (error) {
      yield put(loadProfilesFailure(error.message))
    }
  }

  function* handleWallet(
    action: ConnectWalletSuccessAction | ChangeAccountAction,
  ) {
    yield put(loadProfileRequest(action.payload.wallet.address))
  }

  function* handleSetAlias(action: SetProfileAvatarAliasRequestAction) {
    const { address, alias } = action.payload
    try {
      const newAvatar: Avatar = yield updateProfileAvatarWithoutNewFiles(
        address,
        { hasClaimedName: true, name: alias },
      )

      yield put(setProfileAvatarAliasSuccess(address, alias, newAvatar.version))
    } catch (error) {
      yield put(setProfileAvatarAliasFailure(address, error.message))
    }
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
    action: SetProfileAvatarDescriptionRequestAction,
  ) {
    try {
      const { address, description } = action.payload

      const newAvatar: Avatar = yield updateProfileAvatarWithoutNewFiles(
        address,
        { description: description },
      )

      yield put(
        setProfileAvatarDescriptionSuccess(
          action.payload.address,
          newAvatar.description,
          newAvatar.version,
        ),
      )
    } catch (error) {
      yield put(
        setProfileAvatarDescriptionFailure(
          action.payload.address,
          error.message,
        ),
      )
    }
  }

  function* updateProfileAvatarWithoutNewFiles(
    address: string,
    changes: Partial<Avatar>,
  ) {
    const profile: ProfileEntity = yield call(
      [entities, 'getProfileEntity'],
      address,
    )
    const newAvatar: Avatar = {
      ...profile.metadata.avatars[0],
      ...changes,
      version: profile.metadata.avatars[0].version + 1,
    }
    const profileMetadata: Profile = {
      avatars: [newAvatar, ...profile.metadata.avatars.slice(1)],
    }
    const identity = getIdentity()

    if (identity) {
      yield call(
        [entities, 'deployEntityWithoutNewFiles'],
        profileMetadata,
        getHashesByKeyMap(newAvatar),
        EntityType.PROFILE,
        address,
        identity,
      )
    } else {
      throw new Error(NO_IDENTITY_FOUND_ERROR_MESSAGE)
    }

    return newAvatar
  }

  return profileSaga
}
