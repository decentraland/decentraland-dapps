import { fetchApplicationFeaturesRequest } from './actions'
import { getMockApplicationFeaturesRecord } from './actions.spec'
import {
  getData,
  getError,
  getFeatureVariant,
  getIsFeatureEnabled,
  getLoading,
  hasLoadedInitialFlags,
  isLoadingFeatureFlags
} from './selectors'
import { ApplicationName, StateWithFeatures } from './types'

describe('when getting the features state data', () => {
  let data: ReturnType<typeof getMockApplicationFeaturesRecord>
  let state: StateWithFeatures

  describe('when features is defined', () => {
    beforeEach(() => {
      data = getMockApplicationFeaturesRecord()

      state = {
        features: {
          data,
          error: null,
          hasLoadedInitialFlags: false,
          loading: []
        }
      }
    })

    it('should return the features data', () => {
      expect(getData(state)).toEqual(data)
    })
  })

  describe('when features is undefined', () => {
    beforeEach(() => {
      state = {}
    })

    it('should throw an error indicating features reducer was not implemented', () => {
      expect(() => getData(state)).toThrowError("'features' reducer not implemented")
    })
  })
})

describe('when getting the features state loading', () => {
  it('should return the loading state', () => {
    const loading = [fetchApplicationFeaturesRequest([ApplicationName.ACCOUNT, ApplicationName.BUILDER])]

    const result = getLoading({
      features: {
        data: {},
        error: null,
        hasLoadedInitialFlags: false,
        loading
      }
    })

    expect(result).toEqual(loading)
  })
})

describe('when getting the features state error', () => {
  it('should return the loading state', () => {
    const error = 'error'

    const result = getError({
      features: {
        data: {},
        error,
        hasLoadedInitialFlags: false,
        loading: []
      }
    })

    expect(result).toEqual(error)
  })
})

describe('when getting if a feature is enabled', () => {
  let data: ReturnType<typeof getMockApplicationFeaturesRecord>
  let state: StateWithFeatures

  beforeEach(() => {
    data = getMockApplicationFeaturesRecord()

    state = {
      features: {
        data,
        error: null,
        hasLoadedInitialFlags: false,
        loading: []
      }
    }
  })

  describe('when the application feature is stored as true', () => {
    it('should return true', () => {
      expect(getIsFeatureEnabled(state, ApplicationName.ACCOUNT, 'flag1')).toEqual(true)
    })
  })

  describe('when the application feature is stored as false', () => {
    it('should return false', () => {
      expect(getIsFeatureEnabled(state, ApplicationName.ACCOUNT, 'flag2')).toEqual(false)
    })
  })

  describe('when the application is not found in the state', () => {
    it('should return false', () => {
      expect(getIsFeatureEnabled(state, ApplicationName.DAPPS, 'flag1')).toEqual(false)
    })
  })

  describe('when the feature is found in the env', () => {
    const env = process.env

    let featureName: string

    beforeEach(() => {
      process.env = { ...env }

      featureName = 'crazy-feature-name'
    })

    afterEach(() => {
      process.env = env
    })

    describe('when the env is 1', () => {
      beforeEach(() => {
        process.env.REACT_APP_FF_ACCOUNT_CRAZY_FEATURE_NAME = '1'
      })

      it('should return true', () => {
        expect(getIsFeatureEnabled(state, ApplicationName.ACCOUNT, featureName)).toEqual(true)
      })

      describe('and the feature reducer is undefined', () => {
        beforeEach(() => {
          state = {}
        })

        it('should return true', () => {
          expect(getIsFeatureEnabled(state, ApplicationName.ACCOUNT, featureName)).toEqual(true)
        })
      })
    })

    describe('when the env is 0', () => {
      beforeEach(() => {
        process.env.REACT_APP_FF_ACCOUNT_CRAZY_FEATURE_NAME = '0'
      })

      it('should return false', () => {
        expect(getIsFeatureEnabled(state, ApplicationName.ACCOUNT, featureName)).toEqual(false)
      })
    })

    describe('when the env is neither 0 or 1', () => {
      beforeEach(() => {
        process.env.REACT_APP_FF_ACCOUNT_CRAZY_FEATURE_NAME = 'pikachu'
      })

      it('should return false', () => {
        expect(getIsFeatureEnabled(state, ApplicationName.ACCOUNT, featureName)).toEqual(false)
      })
    })
  })
})

describe('when getting a feature variant', () => {
  let data: ReturnType<typeof getMockApplicationFeaturesRecord>
  let state: StateWithFeatures

  beforeEach(() => {
    data = getMockApplicationFeaturesRecord()
    state = {
      features: {
        data,
        error: null,
        hasLoadedInitialFlags: false,
        loading: []
      }
    }
  })

  describe('when the variant is defined in the environment', () => {
    beforeEach(() => {
      process.env.REACT_APP_FF_VARIANT_DAPPS_TEST_FEATURE = 'test-variant'
    })

    afterEach(() => {
      delete process.env.REACT_APP_FF_VARIANT_DAPPS_TEST_FEATURE
    })

    it('should return a local variant with the environment value', () => {
      expect(getFeatureVariant(state, ApplicationName.DAPPS, 'test-feature')).toEqual({
        name: 'Local variant',
        enabled: true,
        payload: {
          type: 'string',
          value: 'test-variant'
        }
      })
    })
  })

  describe('when the variant is not defined in the environment', () => {
    describe('and the application features are not loaded', () => {
      beforeEach(() => {
        state = {
          features: {
            data: {},
            error: null,
            hasLoadedInitialFlags: false,
            loading: []
          }
        }
      })

      it('should return null', () => {
        expect(getFeatureVariant(state, ApplicationName.DAPPS, 'test-feature')).toBeNull()
      })
    })

    describe('and the application features are loaded', () => {
      describe('and the variant exists', () => {
        beforeEach(() => {
          state = {
            features: {
              data: {
                [ApplicationName.DAPPS]: {
                  name: ApplicationName.DAPPS,
                  flags: {},
                  variants: {
                    'dapps-test-feature': {
                      name: 'Remote variant',
                      enabled: true,
                      payload: {
                        type: 'string',
                        value: 'remote-variant'
                      }
                    }
                  }
                }
              },
              error: null,
              hasLoadedInitialFlags: true,
              loading: []
            }
          }
        })

        it('should return the variant from the store', () => {
          expect(getFeatureVariant(state, ApplicationName.DAPPS, 'test-feature')).toEqual({
            name: 'Remote variant',
            enabled: true,
            payload: {
              type: 'string',
              value: 'remote-variant'
            }
          })
        })
      })

      describe('and the variant does not exist', () => {
        beforeEach(() => {
          state = {
            features: {
              data: {
                [ApplicationName.DAPPS]: {
                  name: ApplicationName.DAPPS,
                  flags: {},
                  variants: {}
                }
              },
              error: null,
              hasLoadedInitialFlags: true,
              loading: []
            }
          }
        })

        it('should return null', () => {
          expect(getFeatureVariant(state, ApplicationName.DAPPS, 'test-feature')).toBeNull()
        })
      })
    })
  })
})

describe('when getting if the feature flags were loaded at least once', () => {
  let state: StateWithFeatures

  beforeEach(() => {
    state = {
      features: {
        data: {},
        error: null,
        hasLoadedInitialFlags: false,
        loading: []
      }
    }
  })

  describe('and the feature flags were not loaded', () => {
    beforeEach(() => {
      state.features!.hasLoadedInitialFlags = false
    })

    it('should return false', () => {
      expect(hasLoadedInitialFlags(state)).toBe(false)
    })
  })

  describe('and the feature flags were loaded', () => {
    beforeEach(() => {
      state.features!.hasLoadedInitialFlags = true
    })

    it('should return true', () => {
      expect(hasLoadedInitialFlags(state)).toBe(true)
    })
  })
})

describe('when getting is the feature flags are being loaded', () => {
  let state: StateWithFeatures

  beforeEach(() => {
    state = {
      features: {
        data: {},
        error: null,
        hasLoadedInitialFlags: false,
        loading: []
      }
    }
  })

  describe('and the feature flags are being loaded', () => {
    beforeEach(() => {
      state.features!.loading = [fetchApplicationFeaturesRequest([ApplicationName.ACCOUNT, ApplicationName.BUILDER])]
    })

    it('should return true', () => {
      expect(isLoadingFeatureFlags(state)).toBe(true)
    })
  })

  describe('and the feature flags are not being loaded', () => {
    beforeEach(() => {
      state.features!.loading = []
    })

    it('should return false', () => {
      expect(isLoadingFeatureFlags(state)).toBe(false)
    })
  })
})
