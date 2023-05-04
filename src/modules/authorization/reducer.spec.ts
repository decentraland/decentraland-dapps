import { ChainId } from '@dcl/schemas'
import {
  FETCH_AUTHORIZATIONS_REQUEST,
  GRANT_TOKEN_REQUEST,
  GRANT_TOKEN_SUCCESS,
  REVOKE_TOKEN_REQUEST,
  REVOKE_TOKEN_SUCCESS,
  fetchAuthorizationsRequest,
  revokeTokenSuccess,
  revokeTokenRequest,
  grantTokenRequest,
  grantTokenSuccess,
  authorizationFlowRequest,
  authorizationFlowSuccess,
  authorizationFlowFailure,
  AuthorizationFlowRequestAction,
  AuthorizationFlowFailureAction,
  AuthorizationFlowSuccessAction
} from './actions'
import {
  authorizationReducer,
  AuthorizationState,
  INITIAL_STATE
} from './reducer'
import { Authorization, AuthorizationAction } from './types'

describe.each([
  {
    type: GRANT_TOKEN_REQUEST,
    action: grantTokenRequest({} as Authorization),
    addLoading: true
  },
  {
    type: REVOKE_TOKEN_REQUEST,
    action: revokeTokenRequest({} as Authorization),
    addLoading: true
  },
  {
    type: GRANT_TOKEN_SUCCESS,
    action: grantTokenSuccess(
      {} as Authorization,
      ChainId.ETHEREUM_GOERLI,
      'tsx'
    )
  },
  {
    type: REVOKE_TOKEN_SUCCESS,
    action: revokeTokenSuccess(
      {} as Authorization,
      ChainId.ETHEREUM_GOERLI,
      'tsx'
    )
  },
  {
    type: FETCH_AUTHORIZATIONS_REQUEST,
    action: fetchAuthorizationsRequest([]),
    addLoading: true
  }
])('when handling $type action', ({ action, addLoading }) => {
  it('should set error as null', () => {
    const initialStateWithError = {
      ...INITIAL_STATE,
      error: 'Something went wrong'
    }
    expect(authorizationReducer(initialStateWithError, action)).toEqual(
      expect.objectContaining({
        error: null
      })
    )
  })

  if (addLoading) {
    it('should add action to loading array', () => {
      expect(authorizationReducer(INITIAL_STATE, action)).toEqual(
        expect.objectContaining({
          loading: [action]
        })
      )
    })
  } else {
    it('should remove action from loading array', () => {
      const initialStateWithLoading = {
        ...INITIAL_STATE,
        loading: [action]
      }
      expect(authorizationReducer(initialStateWithLoading, action)).toEqual(
        expect.objectContaining({
          loading: []
        })
      )
    })
  }
})

describe('authorization flow actions', () => {
  let initialState: AuthorizationState
  let action:
    | AuthorizationFlowRequestAction
    | AuthorizationFlowFailureAction
    | AuthorizationFlowSuccessAction

  describe('when handling AUTHORIZATION_FLOW_REQUEST action', () => {
    beforeEach(() => {
      action = authorizationFlowRequest(
        {} as Authorization,
        AuthorizationAction.GRANT
      )
      initialState = {
        ...INITIAL_STATE,
        authorizationFlowError: 'test error'
      }
    })

    it('should add action to loading array', () => {
      expect(authorizationReducer(initialState, action)).toEqual(
        expect.objectContaining({
          loading: [action]
        })
      )
    })

    it('should remove error', () => {
      expect(authorizationReducer(initialState, action)).toEqual(
        expect.objectContaining({
          authorizationFlowError: null
        })
      )
    })
  })

  describe('when handling AUTHORIZATION_FLOW_SUCCESS action', () => {
    beforeEach(() => {
      action = authorizationFlowSuccess({} as Authorization)
      initialState = {
        ...INITIAL_STATE,
        loading: [action],
        authorizationFlowError: 'test error'
      }
    })

    it('should remove action from loading array', () => {
      expect(authorizationReducer(initialState, action)).toEqual(
        expect.objectContaining({
          loading: []
        })
      )
    })

    it('should remove error', () => {
      expect(authorizationReducer(initialState, action)).toEqual(
        expect.objectContaining({
          authorizationFlowError: null
        })
      )
    })
  })

  describe('when handling AUTHORIZATION_FLOW_FAILURE action', () => {
    beforeEach(() => {
      action = authorizationFlowFailure({} as Authorization, 'an error')
      initialState = {
        ...INITIAL_STATE,
        loading: [action],
        authorizationFlowError: null
      }
    })

    it('should remove action from loading array', () => {
      expect(authorizationReducer(initialState, action)).toEqual(
        expect.objectContaining({
          loading: []
        })
      )
    })

    it('should add error', () => {
      expect(authorizationReducer(initialState, action)).toEqual(
        expect.objectContaining({
          authorizationFlowError: 'an error'
        })
      )
    })
  })
})
