import { takeLatest, put, call, takeEvery } from 'redux-saga/effects'
import { Avatar, EntityType } from '@dcl/schemas'
import { PeerAPI } from '../../lib/peer'
import { EntitiesOperator } from '../../lib/entities'
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
  SET_PROFILE_AVATAR_DESCRIPTION_REQUEST,
  SetProfileAvatarAliasRequestAction,
  SET_PROFILE_AVATAR_ALIAS_REQUEST,
  setProfileAvatarAliasFailure,
  setProfileAvatarAliasSuccess
} from './actions'
import { lambdaProfileToContentProfile } from './utils'
import { Profile } from './types'

type CreateProfileSagaOptions = {
  peerUrl: string
  peerWithNoGbCollectorUrl?: string
}

export function createProfileSaga({
  peerUrl,
  peerWithNoGbCollectorUrl
}: CreateProfileSagaOptions) {
  const peerApi = new PeerAPI(peerUrl)
  const entities = new EntitiesOperator(peerUrl, peerWithNoGbCollectorUrl)

  function* profileSaga() {
    yield takeEvery(LOAD_PROFILE_REQUEST, handleLoadProfileRequest)
    yield takeEvery(
      SET_PROFILE_AVATAR_DESCRIPTION_REQUEST,
      handleSetProfileDescription
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

  function* handleWallet(
    action: ConnectWalletSuccessAction | ChangeAccountAction
  ) {
    yield put(loadProfileRequest(action.payload.wallet.address))
  }

  function* handleSetAlias(action: SetProfileAvatarAliasRequestAction) {
    const { address, alias } = action.payload
    try {
      const newAvatar: Avatar = yield updateProfileAvatarWithoutNewFiles(
        address,
        { hasClaimedName: true, name: alias }
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
    action: SetProfileAvatarDescriptionRequestAction
  ) {
    try {
      const { address, description } = action.payload

      const newAvatar: Avatar = yield updateProfileAvatarWithoutNewFiles(
        address,
        { description: description }
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

  function* updateProfileAvatarWithoutNewFiles(
    address: string,
    changes: Partial<Avatar>
  ) {
    const profile: Profile = yield call([peerApi, 'fetchProfile'], address, {
      useCache: false
    })
    const profileWithContentHashes = lambdaProfileToContentProfile(profile)

    const newAvatar: Avatar = {
      ...profileWithContentHashes.avatars[0],
      ...changes,
      version: profileWithContentHashes.avatars[0].version + 1
    }

    const profileMetadata: Profile = {
      avatars: [newAvatar, ...profileWithContentHashes.avatars.slice(1)]
    }

    yield call(
      [entities, 'deployEntityWithoutNewFiles'],
      profileMetadata,
      EntityType.PROFILE,
      address,
      address
    )

    return newAvatar
  }

  return profileSaga
}
