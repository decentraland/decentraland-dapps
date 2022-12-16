import { Avatar, EntityType } from '@dcl/schemas'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { EntitiesOperator } from '../../lib/entities'
import { profileFromLambda } from '../../tests/profileMocks'
import { ProfileEntity } from '../../lib/types'
import { PeerAPI } from '../../lib/peer'
import { dynamicDeepParametersEquality } from '../../tests/sagas'
import { createProfileSaga } from './sagas'
import { lambdaProfileToContentProfile } from './utils'
import {
  setProfileAvatarAliasFailure,
  setProfileAvatarAliasRequest,
  setProfileAvatarAliasSuccess,
  setProfileAvatarDescriptionFailure,
  setProfileAvatarDescriptionRequest,
  setProfileAvatarDescriptionSuccess
} from './actions'

const profileSagas = createProfileSaga({ peerUrl: 'aURL' })
const address = 'anAddress'
const description = 'aDescription'
const errorMessage = 'anError'

describe('when handling the action to set the profile avatar description', () => {
  describe('when getting the profile entity fails', () => {
    it('should dispatch an action to signal that the request failed', () => {
      return expectSaga(profileSagas)
        .provide([
          [
            matchers.call.fn(PeerAPI.prototype.fetchProfile),
            Promise.reject(new Error(errorMessage))
          ]
        ])
        .put(setProfileAvatarDescriptionFailure(address, errorMessage))
        .dispatch(setProfileAvatarDescriptionRequest(address, description))
        .silentRun()
    })
  })

  describe('when deploying the entity fails', () => {
    it('should dispatch an action to signal that the request failed', () => {
      return expectSaga(profileSagas)
        .provide([
          [
            matchers.call.fn(PeerAPI.prototype.fetchProfile),
            Promise.resolve(profileFromLambda)
          ],
          [
            matchers.call.fn(
              EntitiesOperator.prototype.deployEntityWithoutNewFiles
            ),
            Promise.reject(new Error(errorMessage))
          ]
        ])
        .put(setProfileAvatarDescriptionFailure(address, errorMessage))
        .dispatch(setProfileAvatarDescriptionRequest(address, description))
        .silentRun()
    })
  })

  describe('when the deployment is successful', () => {
    it('should deploy the new entity with the description and the version changed', () => {
      const transformedProfile = lambdaProfileToContentProfile(
        profileFromLambda
      )
      const newAvatar: Avatar = {
        ...transformedProfile.avatars[0],
        version: transformedProfile.avatars[0].version + 1,
        description
      }

      const newProfileMetadata: ProfileEntity['metadata'] = {
        avatars: [newAvatar, ...transformedProfile.avatars.slice(1)]
      }

      return expectSaga(profileSagas)
        .provide([
          [
            matchers.call.fn(PeerAPI.prototype.fetchProfile),
            dynamicDeepParametersEquality(
              [address, { useCache: false }],
              Promise.resolve(profileFromLambda)
            )
          ],
          [
            matchers.call.fn(
              EntitiesOperator.prototype.deployEntityWithoutNewFiles
            ),
            dynamicDeepParametersEquality(
              [newProfileMetadata, EntityType.PROFILE, address, address],
              Promise.resolve(undefined)
            )
          ]
        ])
        .put(
          setProfileAvatarDescriptionSuccess(
            address,
            description,
            newAvatar.version
          )
        )
        .dispatch(setProfileAvatarDescriptionRequest(address, description))
        .silentRun()
    })
  })
})

describe('when handling the action to set the profile avatar alias', () => {
  const alias = 'anAlias'

  describe('when getting the profile entity fails', () => {
    it('should dispatch an action to signal that the request failed', () => {
      return expectSaga(profileSagas)
        .provide([
          [
            matchers.call.fn(PeerAPI.prototype.fetchProfile),
            Promise.reject(new Error(errorMessage))
          ]
        ])
        .put(setProfileAvatarAliasFailure(address, errorMessage))
        .dispatch(setProfileAvatarAliasRequest(address, alias))
        .silentRun()
    })
  })

  describe('when deploying the entity fails', () => {
    it('should dispatch an action to signal that the request failed', () => {
      return expectSaga(profileSagas)
        .provide([
          [
            matchers.call.fn(PeerAPI.prototype.fetchProfile),
            Promise.resolve(profileFromLambda)
          ],
          [
            matchers.call.fn(
              EntitiesOperator.prototype.deployEntityWithoutNewFiles
            ),
            Promise.reject(new Error(errorMessage))
          ]
        ])
        .put(setProfileAvatarAliasFailure(address, errorMessage))
        .dispatch(setProfileAvatarAliasRequest(address, alias))
        .silentRun()
    })
  })

  describe('when the deployment is successful', () => {
    it('should deploy the new entity with the alias and the version changed', () => {
      const transformedProfile = lambdaProfileToContentProfile(
        profileFromLambda
      )
      const newAvatar: Avatar = {
        ...transformedProfile.avatars[0],
        version: transformedProfile.avatars[0].version + 1,
        hasClaimedName: true,
        name: alias
      }

      const newProfileMetadata: ProfileEntity['metadata'] = {
        avatars: [newAvatar, ...transformedProfile.avatars.slice(1)]
      }

      return expectSaga(profileSagas)
        .provide([
          [
            matchers.call.fn(PeerAPI.prototype.fetchProfile),
            dynamicDeepParametersEquality(
              [address, { useCache: false }],
              Promise.resolve(profileFromLambda)
            )
          ],
          [
            matchers.call.fn(
              EntitiesOperator.prototype.deployEntityWithoutNewFiles
            ),
            dynamicDeepParametersEquality(
              [newProfileMetadata, EntityType.PROFILE, address, address],
              Promise.resolve(undefined)
            )
          ]
        ])
        .put(setProfileAvatarAliasSuccess(address, alias, newAvatar.version))
        .dispatch(setProfileAvatarAliasRequest(address, alias))
        .silentRun()
    })
  })
})
