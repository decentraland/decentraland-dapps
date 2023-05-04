import {
  AUTHORIZATION_FLOW_FAILURE,
  AUTHORIZATION_FLOW_REQUEST,
  AUTHORIZATION_FLOW_SUCCESS,
  authorizationFlowFailure,
  authorizationFlowRequest,
  authorizationFlowSuccess
} from './actions'
import { Authorization, AuthorizationAction } from './types'

describe('authorization flow actions', () => {
  describe('when calling authorizationFlowRequest action', () => {
    it('should return the correct action type and payload', () => {
      const authorization = {} as Authorization
      const authorizationAction = AuthorizationAction.GRANT
      const allowance = '10'
      expect(
        authorizationFlowRequest(authorization, authorizationAction, allowance)
      ).toEqual({
        type: AUTHORIZATION_FLOW_REQUEST,
        payload: {
          authorization,
          authorizationAction,
          allowance
        }
      })
    })
  })

  describe('when calling authorizationFlowSuccess action', () => {
    it('should return the correct action type and payload', () => {
      const authorization = {} as Authorization
      expect(authorizationFlowSuccess(authorization)).toEqual({
        type: AUTHORIZATION_FLOW_SUCCESS,
        payload: {
          authorization
        }
      })
    })
  })

  describe('when calling authorizationFlowFailure action', () => {
    it('should return the correct action type and payload', () => {
      const authorization = {} as Authorization
      const error = 'some error'
      expect(authorizationFlowFailure(authorization, error)).toEqual({
        type: AUTHORIZATION_FLOW_FAILURE,
        payload: {
          authorization,
          error
        }
      })
    })
  })
})
