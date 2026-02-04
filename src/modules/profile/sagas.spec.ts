import { AuthIdentity } from '@dcl/crypto'
import { EntityType } from '@dcl/schemas/dist/platform/entity'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { EntitiesOperator } from '../../lib/entities'
import { profileFromLambda, profileFromContent } from '../../tests/profileMocks'
import { PeerAPI } from '../../lib/peer'
import { dynamicDeepParametersEquality } from '../../tests/sagas'
import { NO_IDENTITY_FOUND_ERROR_MESSAGE, createProfileSaga } from './sagas'
import {
  loadProfilesFailure,
  loadProfilesRequest,
  loadProfilesSuccess,
  setProfileAvatarAliasFailure,
  setProfileAvatarAliasRequest,
  setProfileAvatarAliasSuccess,
  setProfileAvatarDescriptionFailure,
  setProfileAvatarDescriptionRequest,
  setProfileAvatarDescriptionSuccess
} from './actions'

let mockAuthIdentity: AuthIdentity | undefined = {} as AuthIdentity

const profileSagas = createProfileSaga({
  getIdentity: () => mockAuthIdentity,
  peerUrl: 'aURL'
})
const address = 'anAddress'
const description = 'aDescription'
const errorMessage = 'anError'

describe('when handling the action to set the profile avatar description', () => {
  describe('and getting the profile entity fails', () => {
    it('should dispatch an action to signal that the request failed', () => {
      return expectSaga(profileSagas)
        .provide([[matchers.call.fn(EntitiesOperator.prototype.getProfileEntity), Promise.reject(new Error(errorMessage))]])
        .put(setProfileAvatarDescriptionFailure(address, errorMessage))
        .dispatch(setProfileAvatarDescriptionRequest(address, description))
        .silentRun()
    })
  })

  describe('and deploying the entity fails', () => {
    it('should dispatch an action to signal that the request failed', () => {
      return expectSaga(profileSagas)
        .provide([
          [matchers.call.fn(EntitiesOperator.prototype.getProfileEntity), Promise.resolve(profileFromContent)],
          [matchers.call.fn(EntitiesOperator.prototype.deployEntityWithoutFiles), Promise.reject(new Error(errorMessage))]
        ])
        .put(setProfileAvatarDescriptionFailure(address, errorMessage))
        .dispatch(setProfileAvatarDescriptionRequest(address, description))
        .silentRun()
    })
  })

  describe('and the deployment is successful', () => {
    it('should deploy the new entity with the description and the version changed', () => {
      const {
        avatar: { snapshots, ...avatarInfoWithoutSnapshots },
        ...restOfAvatar
      } = profileFromContent.metadata.avatars[0]
      const newAvatar = {
        ...restOfAvatar,
        avatar: avatarInfoWithoutSnapshots,
        version: profileFromContent.metadata.avatars[0].version + 1,
        description
      }

      const newProfileMetadata = {
        avatars: [newAvatar, ...profileFromContent.metadata.avatars.slice(1)]
      }

      return expectSaga(profileSagas)
        .provide([
          [
            matchers.call.fn(EntitiesOperator.prototype.getProfileEntity),
            dynamicDeepParametersEquality([address], Promise.resolve(profileFromContent))
          ],
          [
            matchers.call.fn(EntitiesOperator.prototype.deployEntityWithoutFiles),
            dynamicDeepParametersEquality([EntityType.PROFILE, newProfileMetadata, address, mockAuthIdentity], Promise.resolve(undefined))
          ]
        ])
        .put(setProfileAvatarDescriptionSuccess(address, description, newAvatar.version))
        .dispatch(setProfileAvatarDescriptionRequest(address, description))
        .silentRun()
    })
  })
})

describe('when handling the action to set the profile avatar alias', () => {
  const alias = 'anAlias'

  describe('and getting the profile entity fails', () => {
    it('should dispatch an action to signal that the request failed', () => {
      return expectSaga(profileSagas)
        .provide([[matchers.call.fn(EntitiesOperator.prototype.getProfileEntity), Promise.reject(new Error(errorMessage))]])
        .put(setProfileAvatarAliasFailure(address, errorMessage))
        .dispatch(setProfileAvatarAliasRequest(address, alias))
        .silentRun()
    })
  })

  describe('and there is no identity available', () => {
    beforeEach(() => {
      mockAuthIdentity = undefined
    })
    afterAll(() => {
      mockAuthIdentity = {} as AuthIdentity
    })
    it('should dispatch an action to signal that the request failed', () => {
      return expectSaga(profileSagas)
        .provide([
          [
            matchers.call.fn(EntitiesOperator.prototype.getProfileEntity),
            dynamicDeepParametersEquality([address], Promise.resolve(profileFromContent))
          ]
        ])
        .put(setProfileAvatarAliasFailure(address, NO_IDENTITY_FOUND_ERROR_MESSAGE))
        .dispatch(setProfileAvatarAliasRequest(address, alias))
        .silentRun()
    })
  })

  describe('and deploying the entity fails', () => {
    it('should dispatch an action to signal that the request failed', () => {
      return expectSaga(profileSagas)
        .provide([
          [matchers.call.fn(EntitiesOperator.prototype.getProfileEntity), Promise.resolve(profileFromContent)],
          [matchers.call.fn(EntitiesOperator.prototype.deployEntityWithoutFiles), Promise.reject(new Error(errorMessage))]
        ])
        .put(setProfileAvatarAliasFailure(address, errorMessage))
        .dispatch(setProfileAvatarAliasRequest(address, alias))
        .silentRun()
    })
  })

  describe('and the deployment is successful', () => {
    it('should deploy the new entity with the alias and the version changed', () => {
      const {
        avatar: { snapshots, ...avatarInfoWithoutSnapshots },
        ...restOfAvatar
      } = profileFromContent.metadata.avatars[0]
      const newAvatar = {
        ...restOfAvatar,
        avatar: avatarInfoWithoutSnapshots,
        version: profileFromContent.metadata.avatars[0].version + 1,
        hasClaimedName: true,
        name: alias
      }

      const newProfileMetadata = {
        avatars: [newAvatar, ...profileFromContent.metadata.avatars.slice(1)]
      }

      return expectSaga(profileSagas)
        .provide([
          [
            matchers.call.fn(EntitiesOperator.prototype.getProfileEntity),
            dynamicDeepParametersEquality([address], Promise.resolve(profileFromContent))
          ],
          [
            matchers.call.fn(EntitiesOperator.prototype.deployEntityWithoutFiles),
            dynamicDeepParametersEquality([EntityType.PROFILE, newProfileMetadata, address, mockAuthIdentity], Promise.resolve(undefined))
          ]
        ])
        .put(setProfileAvatarAliasSuccess(address, alias, newAvatar.version))
        .dispatch(setProfileAvatarAliasRequest(address, alias))
        .silentRun()
    })
  })
})

describe('when handling the action to load multiple profiles', () => {
  describe('and the fetching of the profiles fails', () => {
    it('should put the load profiles failure action with the error', () => {
      const error = new Error('anError')
      return expectSaga(profileSagas)
        .provide([[matchers.call.fn(PeerAPI.prototype.fetchProfiles), Promise.reject(error)]])
        .put(loadProfilesFailure(error.message))
        .dispatch(loadProfilesRequest(['anAddress']))
        .silentRun()
    })
  })

  describe('and the fetching of the profiles is successful', () => {
    it('should put the load profiles success action with the profiles', () => {
      const profiles = [profileFromLambda]
      return expectSaga(profileSagas)
        .provide([[matchers.call.fn(PeerAPI.prototype.fetchProfiles), Promise.resolve(profiles)]])
        .put(loadProfilesSuccess(profiles))
        .dispatch(loadProfilesRequest([profiles[0].avatars[0].userId]))
        .silentRun()
    })
  })
})
