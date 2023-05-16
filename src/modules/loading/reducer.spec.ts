import { AnyAction } from 'redux'
import { INITIAL_STATE, LoadingState, loadingReducer } from './reducer'

let action: AnyAction
let state: LoadingState

beforeEach(() => {
  state = INITIAL_STATE
})

describe('when handling [Request] action', () => {
  beforeEach(() => {
    state = []
    action = {
      type: '[Request] Load some data'
    }
  })

  it('should add element to loading array', () => {
    expect(loadingReducer(state, action)).toEqual([action])
  })
})

describe('when handling [Success] action', () => {
  beforeEach(() => {
    state = [{ type: '[Request] Load some data' }]
    action = {
      type: '[Success] Load some data'
    }
  })

  it('should remove element from loading array', () => {
    expect(loadingReducer(state, action)).toEqual([])
  })
})

describe('when handling [Failure] action', () => {
  beforeEach(() => {
    state = [{ type: '[Request] Load some data' }]
    action = {
      type: '[Failure] Load some data'
    }
  })

  it('should remove element from loading array', () => {
    expect(loadingReducer(state, action)).toEqual([])
  })
})

describe('when handling [Clear] action', () => {
  beforeEach(() => {
    state = [{ type: '[Request] Load some data' }]
    action = {
      type: '[Clear] Load some data'
    }
  })

  it('should remove element from loading array', () => {
    expect(loadingReducer(state, action)).toEqual([])
  })
})

describe('when handling a different type action', () => {
  beforeEach(() => {
    state = []
    action = {
      type: 'Load some data'
    }
  })

  it('should not change the state', () => {
    expect(loadingReducer(state, action)).toEqual(state)
  })
})
