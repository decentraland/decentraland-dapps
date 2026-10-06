import { act, renderHook } from '@testing-library/react'
import { AuthIdentity } from 'decentraland-crypto-fetch'
import { NOTIFICATIONS_QUERY_INTERVAL } from '../containers/Navbar/constants'
import { ClientError } from '../lib/ClientError'
import { NotificationsAPI } from '../modules/notifications'
import useNotifications from './useNotifications'

jest.mock('../containers/Profile', () => ({
  __esModule: true,
  default: () => null
}))

const identity = {} as AuthIdentity

const flushPromises = async () => {
  await act(async () => {
    await Promise.resolve()
  })
}

describe('useNotifications', () => {
  let getNotificationsSpy: jest.SpyInstance
  let warnSpy: jest.SpyInstance

  beforeEach(() => {
    jest.useFakeTimers()
    getNotificationsSpy = jest.spyOn(NotificationsAPI.prototype, 'getNotifications')
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('when the notifications are fetched successfully', () => {
    beforeEach(() => {
      getNotificationsSpy.mockResolvedValue([])
    })

    it('should stop loading and keep polling', async () => {
      const { result } = renderHook(() => useNotifications(identity, true))
      await flushPromises()

      expect(result.current.isLoading).toBe(false)

      await act(async () => {
        jest.advanceTimersByTime(NOTIFICATIONS_QUERY_INTERVAL)
      })

      expect(getNotificationsSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('when the server no longer accepts the identity', () => {
    beforeEach(() => {
      getNotificationsSpy.mockRejectedValue(new ClientError('This endpoint requires a signed fetch request. See ADR-44.', 401, null))
    })

    it('should stop loading without logging the failure', async () => {
      const { result } = renderHook(() => useNotifications(identity, true))
      await flushPromises()

      expect(result.current.isLoading).toBe(false)
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('should stop polling', async () => {
      renderHook(() => useNotifications(identity, true))
      await flushPromises()

      await act(async () => {
        jest.advanceTimersByTime(NOTIFICATIONS_QUERY_INTERVAL * 3)
      })

      expect(getNotificationsSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the request fails for any other reason', () => {
    let failure: ClientError

    beforeEach(() => {
      failure = new ClientError('Request failed with status code 503', 503, null)
      getNotificationsSpy.mockRejectedValue(failure)
    })

    it('should stop loading and log the failure', async () => {
      const { result } = renderHook(() => useNotifications(identity, true))
      await flushPromises()

      expect(result.current.isLoading).toBe(false)
      expect(warnSpy).toHaveBeenCalledWith('Error fetching notifications:', failure)
    })

    it('should keep polling', async () => {
      renderHook(() => useNotifications(identity, true))
      await flushPromises()

      await act(async () => {
        jest.advanceTimersByTime(NOTIFICATIONS_QUERY_INTERVAL)
      })

      expect(getNotificationsSpy).toHaveBeenCalledTimes(2)
    })
  })
})
