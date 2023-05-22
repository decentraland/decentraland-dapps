import { INITIAL_STATE } from './reducer'
import { getAuthorizationFlowError } from './selectors'

describe('when getting authorization flow error', () => {
  it('should return the correct value', () => {
    const error = 'an authorization flow error message'
    expect(
      getAuthorizationFlowError({
        authorization: {
          ...INITIAL_STATE,
          authorizationFlowError: error
        }
      })
    ).toEqual(error)
  })
})
