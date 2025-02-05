import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import {
  NotificationsAPI,
  checkIsOnboarding,
  setOnboardingDone
} from '../modules/notifications'
import { AuthIdentity } from 'decentraland-crypto-fetch'
import {
  DCLNotification,
  NotificationActiveTab
} from 'decentraland-ui/dist/components/Notifications/types'
import { CURRENT_AVAILABLE_NOTIFICATIONS } from 'decentraland-ui/dist/components/Notifications/utils'
import { NOTIFICATIONS_QUERY_INTERVAL } from '../containers/Navbar/constants'
import Profile from '../containers/Profile'
import { getBaseUrl } from '../lib'

const useNotifications = (
  identity: AuthIdentity | undefined,
  isNotificationsEnabled: boolean
) => {
  const [{ isLoading, notifications }, setUserNotifications] = useState<{
    isLoading: boolean
    notifications: DCLNotification[]
  }>({
    isLoading: false,
    notifications: []
  })

  const [{ activeTab, isOnboarding, isOpen }, setNotificationsState] = useState({
    activeTab: NotificationActiveTab.NEWEST,
    isOnboarding: checkIsOnboarding(),
    isOpen: false
  })

  const latestIdentityRef = useRef<AuthIdentity | undefined>(identity)
  const clientRef = useRef<NotificationsAPI | null>(null)

  useEffect(() => {
    if (identity) {
      latestIdentityRef.current = identity
    }
  }, [identity])

  const notificationsClient: NotificationsAPI | null = useMemo(() => {
    if (identity) {
      const client = new NotificationsAPI({ identity })
      clientRef.current = client
      return client
    }
    return null
  }, [identity])

  const fetchNotificationsState = async () => {
    const client = clientRef.current
    if (!client) return []

    setUserNotifications(prev => ({ ...prev, isLoading: true }))

    try {
      const retrievedNotifications = await client.getNotifications()
      const filteredNotifications = retrievedNotifications?.filter(notification =>
        CURRENT_AVAILABLE_NOTIFICATIONS.includes(notification.type)
      ) || []

      setUserNotifications({
        isLoading: false,
        notifications: filteredNotifications
      })

      return filteredNotifications
    } catch {
      setUserNotifications(prev => ({ ...prev, isLoading: false }))
      return []
    }
  }

  const handleOnBegin = () => {
    setOnboardingDone()
    setNotificationsState(prevState => ({ ...prevState, isOnboarding: false }))
  }

  const handleNotificationsOpen = async () => {
    const currentOpenState = isOpen
    const currentIdentity = identity || latestIdentityRef.current
    const client = clientRef.current

    if (!currentOpenState && currentIdentity && client) {
      const freshNotifications = await fetchNotificationsState()
      const unreadNotifications = freshNotifications
        .filter(notification => !notification.read)
        .map(({ id }) => id)

      if (unreadNotifications.length) {
        await client.markNotificationsAsRead(unreadNotifications)
        setUserNotifications(prevState => ({
          ...prevState,
          notifications: prevState.notifications.map(notification => ({
            ...notification,
            read: unreadNotifications.includes(notification.id) ? true : notification.read
          }))
        }))
      }
    }

    setNotificationsState(prevState => ({
      ...prevState,
      isOpen: !prevState.isOpen
    }))
  }

  const handleOnChangeModalTab = (tab: NotificationActiveTab) =>
    setNotificationsState(prevState => ({
      ...prevState,
      activeTab: tab
    }))

  const handleRenderProfile = useCallback((address: string) => (
    <Profile
      address={address}
      href={`${getBaseUrl()}/profile/accounts/${address}`}
      style={{ fontWeight: 500, color: 'white', textDecoration: 'none' }}
      target="_blank"
    />
  ), [])

  useEffect((): any => {
    if (identity && isNotificationsEnabled) {
      fetchNotificationsState()
      const interval = setInterval(fetchNotificationsState, NOTIFICATIONS_QUERY_INTERVAL)
      return () => clearInterval(interval)
    }
  }, [identity, isNotificationsEnabled])

  return {
    notificationsClient,
    notifications,
    isLoading,
    isModalOpen: isOpen,
    modalActiveTab: activeTab,
    isNotificationsOnboarding: isOnboarding,
    handleOnBegin,
    handleNotificationsOpen,
    handleOnChangeModalTab,
    handleRenderProfile
  }
}

export default useNotifications
