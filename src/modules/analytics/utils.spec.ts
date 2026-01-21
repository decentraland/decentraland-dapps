import { AnyAction } from 'redux'
import { isbot } from 'isbot'
import {
  add,
  track,
  isTrackable,
  getAnalytics,
  configure,
  trackConnectWallet,
  getAnonymousId,
  hasEvmWallet,
  getEvmWallets,
  hasSolanaWallet,
  getSolanaWallets,
  getAllWallets,
  trackedActions,
  resetMiddlewareRegistration,
} from './utils'

jest.mock('isbot')

const mockIsbot = isbot as jest.MockedFunction<typeof isbot>

describe('Analytics Utils', () => {
  let mockWindow: any
  let mockAnalytics: any

  beforeEach(() => {
    mockAnalytics = {
      track: jest.fn(),
      user: jest.fn().mockReturnValue({ anonymousId: jest.fn() }),
      addSourceMiddleware: jest.fn(),
      _walletMiddlewareRegistered: false,
    }

    mockWindow = {
      navigator: { userAgent: 'test-user-agent' },
      analytics: mockAnalytics,
      ethereum: undefined,
      solana: undefined,
    }

    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
    })

    // Clear tracked actions before each test
    Object.keys(trackedActions).forEach((key) => delete trackedActions[key])

    // Reset middleware registration for each test
    resetMiddlewareRegistration()

    mockIsbot.mockReturnValue(false)
  })

  afterEach(() => {
    jest.resetAllMocks()
    // Clean up any tracked actions and state
    Object.keys(trackedActions).forEach((key) => delete trackedActions[key])
    resetMiddlewareRegistration()
  })

  describe('add function', () => {
    describe('when adding a new action type', () => {
      let actionType: string
      let eventName: string
      let getPayload: jest.Mock

      beforeEach(() => {
        actionType = 'TEST_ACTION'
        eventName = 'Test Event'
        getPayload = jest.fn()
      })

      it('should add the action to trackedActions', () => {
        add(actionType, eventName, getPayload)

        expect(trackedActions[actionType]).toEqual({
          actionType,
          eventName,
          getPayload,
        })
      })
    })

    describe('when adding an already tracked action type', () => {
      let actionType: string
      let consoleSpy: jest.SpyInstance
      let originalAction: any

      beforeEach(() => {
        actionType = 'EXISTING_ACTION'
        consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
        trackedActions[actionType] = { actionType }
        originalAction = trackedActions[actionType]
      })

      afterEach(() => {
        consoleSpy.mockRestore()
      })

      it('should log a warning message', () => {
        add(actionType)

        expect(consoleSpy).toHaveBeenCalledWith(
          `Analytics: the action type "${actionType}" is already being tracked!`,
        )
      })

      it('should not update the existing tracked action', () => {
        add(actionType, 'New Event')

        expect(trackedActions[actionType]).toEqual(originalAction)
      })
    })
  })

  describe('track function', () => {
    describe('when analytics is available', () => {
      let action: AnyAction

      beforeEach(() => {
        action = { type: 'TEST_ACTION', payload: 'test' }
        trackedActions['TEST_ACTION'] = {
          actionType: 'TEST_ACTION',
          eventName: 'Test Event',
          getPayload: jest.fn().mockReturnValue({ data: 'test' }),
        }
      })

      it('should call analytics.track with the event name and payload', () => {
        track(action)

        expect(mockAnalytics.track).toHaveBeenCalledWith('Test Event', {
          data: 'test',
        })
      })
    })

    describe('when analytics is not available', () => {
      let action: AnyAction

      beforeEach(() => {
        mockIsbot.mockReturnValue(true)
        action = { type: 'TEST_ACTION' }
      })

      it('should not call analytics.track', () => {
        track(action)

        expect(mockAnalytics.track).not.toHaveBeenCalled()
      })
    })

    describe('when action is not trackable', () => {
      let consoleSpy: jest.SpyInstance
      let action: AnyAction

      beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
        action = { type: 'UNKNOWN_ACTION' }
      })

      afterEach(() => {
        consoleSpy.mockRestore()
      })

      it('should not call analytics.track', () => {
        track(action)

        expect(mockAnalytics.track).not.toHaveBeenCalled()
      })
    })

    describe('when eventName is a function', () => {
      let action: AnyAction
      let eventNameFn: jest.Mock

      beforeEach(() => {
        action = { type: 'DYNAMIC_ACTION', id: 123 }
        eventNameFn = jest.fn().mockReturnValue('Dynamic Event 123')
        trackedActions['DYNAMIC_ACTION'] = {
          actionType: 'DYNAMIC_ACTION',
          eventName: eventNameFn,
        }
      })

      it('should call the eventName function with the action', () => {
        track(action)

        expect(eventNameFn).toHaveBeenCalledWith(action)
      })

      it('should use the result as the event name', () => {
        track(action)

        expect(mockAnalytics.track).toHaveBeenCalledWith(
          'Dynamic Event 123',
          undefined,
        )
      })
    })

    describe('when no eventName is provided', () => {
      let action: AnyAction

      beforeEach(() => {
        action = { type: 'NO_EVENT_NAME_ACTION' }
        trackedActions['NO_EVENT_NAME_ACTION'] = {
          actionType: 'NO_EVENT_NAME_ACTION',
        }
      })

      it('should use the action type as the event name', () => {
        track(action)

        expect(mockAnalytics.track).toHaveBeenCalledWith(
          'NO_EVENT_NAME_ACTION',
          undefined,
        )
      })
    })
  })

  describe('isTrackable function', () => {
    describe('when action has a tracked type', () => {
      let action: AnyAction

      beforeEach(() => {
        action = { type: 'TRACKED_ACTION' }
        trackedActions['TRACKED_ACTION'] = { actionType: 'TRACKED_ACTION' }
      })

      it('should return true', () => {
        const result = isTrackable(action)

        expect(result).toBe(true)
      })
    })

    describe('when action has an untracked type', () => {
      let action: AnyAction

      beforeEach(() => {
        action = { type: 'UNTRACKED_ACTION' }
      })

      it('should return false', () => {
        const result = isTrackable(action)

        expect(result).toBe(false)
      })
    })

    describe('when action is invalid', () => {
      let consoleSpy: jest.SpyInstance

      beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      })

      afterEach(() => {
        consoleSpy.mockRestore()
      })

      it('should log a warning and return false for null action', () => {
        const result = isTrackable(null as any)

        expect(consoleSpy).toHaveBeenCalledWith(
          'Analytics: invalid action "null"',
        )
        expect(result).toBe(false)
      })

      it('should log a warning and return false for action without type', () => {
        const action = { payload: 'test' } as any
        const result = isTrackable(action)

        expect(consoleSpy).toHaveBeenCalledWith(
          `Analytics: invalid action "${JSON.stringify(action)}"`,
        )
        expect(result).toBe(false)
      })
    })
  })

  describe('getAnalytics function', () => {
    describe('when window is undefined', () => {
      beforeEach(() => {
        Object.defineProperty(global, 'window', {
          value: undefined,
          writable: true,
        })
      })

      it('should return undefined', () => {
        const result = getAnalytics()

        expect(result).toBeUndefined()
      })
    })

    describe('when window.analytics is undefined', () => {
      beforeEach(() => {
        const windowWithoutAnalytics = {
          navigator: { userAgent: 'test-user-agent' },
        }
        Object.defineProperty(global, 'window', {
          value: windowWithoutAnalytics,
          writable: true,
        })
      })

      it('should return undefined', () => {
        const result = getAnalytics()

        expect(result).toBeUndefined()
      })
    })

    describe('when user agent is not a bot', () => {
      beforeEach(() => {
        mockIsbot.mockReturnValue(false)
      })

      it('should return the analytics object', () => {
        const result = getAnalytics()

        expect(result).toBe(mockAnalytics)
      })

      it('should register wallet middleware', () => {
        getAnalytics()

        expect(mockAnalytics.addSourceMiddleware).toHaveBeenCalled()
      })
    })

    describe('when user agent is a bot', () => {
      beforeEach(() => {
        mockIsbot.mockReturnValue(true)
      })

      it('should return undefined', () => {
        const result = getAnalytics()

        expect(result).toBeUndefined()
      })
    })
  })

  describe('configure function', () => {
    let transformPayload: jest.Mock

    beforeEach(() => {
      transformPayload = jest.fn()
    })

    it('should set the transformPayload function', () => {
      configure({ transformPayload })

      const action = { type: 'TEST_ACTION' }
      trackedActions['TEST_ACTION'] = {
        actionType: 'TEST_ACTION',
        getPayload: jest.fn().mockReturnValue({ data: 'test' }),
      }

      track(action)

      expect(transformPayload).toHaveBeenCalledWith({ data: 'test' })
    })
  })

  describe('trackConnectWallet function', () => {
    describe('when analytics is available', () => {
      let props: any

      beforeEach(() => {
        props = {
          address: '0x123',
          providerType: 'metamask',
          chainId: 1,
          walletName: 'MetaMask',
        }
      })

      it('should call analytics.track with Connect Wallet event', () => {
        trackConnectWallet(props)

        expect(mockAnalytics.track).toHaveBeenCalledWith(
          'Connect Wallet',
          props,
        )
      })
    })

    describe('when analytics is not available', () => {
      let props: any

      beforeEach(() => {
        mockIsbot.mockReturnValue(true)
        props = { address: '0x123', providerType: 'metamask', chainId: 1 }
      })

      it('should not call analytics.track', () => {
        trackConnectWallet(props)

        expect(mockAnalytics.track).not.toHaveBeenCalled()
      })
    })
  })

  describe('getAnonymousId function', () => {
    describe('when analytics is available', () => {
      let mockAnonymousId: jest.Mock

      beforeEach(() => {
        mockAnonymousId = jest.fn().mockReturnValue('anonymous-123')
        mockAnalytics.user.mockReturnValue({ anonymousId: mockAnonymousId })
      })

      it('should return the anonymous ID', () => {
        const result = getAnonymousId()

        expect(result).toBe('anonymous-123')
      })
    })

    describe('when analytics is not available', () => {
      beforeEach(() => {
        mockIsbot.mockReturnValue(true)
      })

      it('should return undefined', () => {
        const result = getAnonymousId()

        expect(result).toBeUndefined()
      })
    })
  })

  describe('hasEvmWallet function', () => {
    describe('when user agent is not a bot', () => {
      describe('and ethereum is available', () => {
        beforeEach(() => {
          mockWindow.ethereum = {}
        })

        it('should return true', () => {
          const result = hasEvmWallet()

          expect(result).toBe(true)
        })
      })

      describe('and ethereum is not available', () => {
        it('should return false', () => {
          const result = hasEvmWallet()

          expect(result).toBe(false)
        })
      })
    })

    describe('when user agent is a bot', () => {
      beforeEach(() => {
        mockIsbot.mockReturnValue(true)
      })

      it('should return undefined', () => {
        const result = hasEvmWallet()

        expect(result).toBeUndefined()
      })
    })
  })

  describe('getEvmWallets function', () => {
    describe('when user agent is not a bot', () => {
      describe('and ethereum is available', () => {
        describe('and is Rabby wallet', () => {
          beforeEach(() => {
            mockWindow.ethereum = { isRabby: true }
          })

          it('should return rabby in the list', () => {
            const result = getEvmWallets()

            expect(result).toEqual(['rabby'])
          })
        })

        describe('and is MetaMask wallet', () => {
          beforeEach(() => {
            mockWindow.ethereum = { isMetaMask: true }
          })

          it('should return metamask in the list', () => {
            const result = getEvmWallets()

            expect(result).toEqual(['metamask'])
          })
        })

        describe('and is Coinbase wallet', () => {
          beforeEach(() => {
            mockWindow.ethereum = { isCoinbaseWallet: true }
          })

          it('should return coinbase in the list', () => {
            const result = getEvmWallets()

            expect(result).toEqual(['coinbase'])
          })
        })

        describe('and has multiple wallet types', () => {
          beforeEach(() => {
            mockWindow.ethereum = { isMetaMask: true, isCoinbaseWallet: true }
          })

          it('should return all detected wallets', () => {
            const result = getEvmWallets()

            expect(result).toContain('metamask')
            expect(result).toContain('coinbase')
          })
        })
      })

      describe('and ethereum is not available', () => {
        it('should return empty array', () => {
          const result = getEvmWallets()

          expect(result).toEqual([])
        })
      })
    })

    describe('when user agent is a bot', () => {
      beforeEach(() => {
        mockIsbot.mockReturnValue(true)
      })

      it('should return undefined', () => {
        const result = getEvmWallets()

        expect(result).toBeUndefined()
      })
    })
  })

  describe('hasSolanaWallet function', () => {
    describe('when user agent is not a bot', () => {
      describe('and solana wallet is available', () => {
        beforeEach(() => {
          mockWindow.solana = {}
        })

        it('should return true', () => {
          const result = hasSolanaWallet()

          expect(result).toBe(true)
        })
      })

      describe('and brave solana wallet is available', () => {
        beforeEach(() => {
          mockWindow.braveSolana = { isBraveWallet: true }
        })

        it('should return true', () => {
          const result = hasSolanaWallet()

          expect(result).toBe(true)
        })
      })

      describe('and no solana wallet is available', () => {
        it('should return false', () => {
          const result = hasSolanaWallet()

          expect(result).toBe(false)
        })
      })
    })

    describe('when user agent is a bot', () => {
      beforeEach(() => {
        mockIsbot.mockReturnValue(true)
      })

      it('should return undefined', () => {
        const result = hasSolanaWallet()

        expect(result).toBeUndefined()
      })
    })
  })

  describe('getSolanaWallets function', () => {
    describe('when user agent is not a bot', () => {
      describe('and phantom wallet is available', () => {
        beforeEach(() => {
          mockWindow.solana = { isPhantom: true }
        })

        it('should return phantom in the list', () => {
          const result = getSolanaWallets()

          expect(result).toEqual(['phantom'])
        })
      })

      describe('and multiple solana wallets are available', () => {
        beforeEach(() => {
          mockWindow.solana = { isPhantom: true }
          mockWindow.coin98 = {}
          mockWindow.glowSolana = {}
        })

        it('should return all detected wallets', () => {
          const result = getSolanaWallets()

          expect(result).toContain('phantom')
          expect(result).toContain('coin98')
          expect(result).toContain('glow')
        })
      })

      describe('and no solana wallets are available', () => {
        it('should return empty array', () => {
          const result = getSolanaWallets()

          expect(result).toEqual([])
        })
      })
    })

    describe('when user agent is a bot', () => {
      beforeEach(() => {
        mockIsbot.mockReturnValue(true)
      })

      it('should return undefined', () => {
        const result = getSolanaWallets()

        expect(result).toBeUndefined()
      })
    })
  })

  describe('getAllWallets function', () => {
    describe('when both EVM and Solana wallets are available', () => {
      beforeEach(() => {
        mockWindow.ethereum = { isMetaMask: true }
        mockWindow.solana = { isPhantom: true }
      })

      it('should return combined list of all wallets', () => {
        const result = getAllWallets()

        expect(result).toContain('metamask')
        expect(result).toContain('phantom')
      })
    })

    describe('when wallets are not available due to bot detection', () => {
      beforeEach(() => {
        mockIsbot.mockReturnValue(true)
      })

      it('should return empty array', () => {
        const result = getAllWallets()

        expect(result).toEqual([])
      })
    })
  })
})
