import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DCLNotification,
  NotificationActiveTab,
} from 'decentraland-ui/dist/components/Notifications/types'
import { CURRENT_AVAILABLE_NOTIFICATIONS } from 'decentraland-ui/dist/components/Notifications/utils'
import { CURRENT_AVAILABLE_NOTIFICATIONS as CURRENT_AVAILABLE_NOTIFICATIONS_UI2 } from 'decentraland-ui2/dist/components/Notifications/utils'
import { AuthIdentity } from 'decentraland-crypto-fetch'
import { NOTIFICATIONS_QUERY_INTERVAL } from '../containers/Navbar/constants'
import Profile from '../containers/Profile'
import { getBaseUrl } from '../lib'
import {
  NotificationsAPI,
  checkIsOnboarding,
  setOnboardingDone,
} from '../modules/notifications'

const useNotifications = (
  identity: AuthIdentity | undefined,
  isNotificationsEnabled: boolean,
) => {
  const [{ isLoading, notifications }, setUserNotifications] = useState<{
    isLoading: boolean
    notifications: DCLNotification[]
  }>({
    isLoading: false,
    notifications: [],
  })

  const [{ activeTab, isOnboarding, isOpen }, setNotificationsState] = useState(
    {
      activeTab: NotificationActiveTab.NEWEST,
      isOnboarding: checkIsOnboarding(),
      isOpen: false,
    },
  )

  const [notificationsClient, setNotificationsClient] =
    useState<NotificationsAPI | null>(null)

  const AVAILABLE_NOTIFICATIONS = useMemo(() => {
    return new Set([
      ...CURRENT_AVAILABLE_NOTIFICATIONS,
      ...CURRENT_AVAILABLE_NOTIFICATIONS_UI2,
    ])
  }, [])

  const handleOnBegin = () => {
    setOnboardingDone()
    setNotificationsState((prevState) => ({
      ...prevState,
      isOnboarding: false,
    }))
  }

  const fetchAndUpdateNotifications = useCallback(
    async (scopedNotificationsClient: NotificationsAPI) => {
      return scopedNotificationsClient
        .getNotifications()
        .then((notificationsFetched) => {
          const filteredNotifications = notificationsFetched.filter(
            (notification) => AVAILABLE_NOTIFICATIONS.has(notification.type),
          )

          setUserNotifications((prevState) => ({
            ...prevState,
            isLoading: false,
            notifications: filteredNotifications,
          }))
        })
    },
    [],
  )

  useEffect(() => {
    if (identity) {
      const notificationsClient = new NotificationsAPI({ identity })
      setNotificationsClient(notificationsClient)

      if (isNotificationsEnabled) {
        setUserNotifications((prevState) => ({ ...prevState, isLoading: true }))

        fetchAndUpdateNotifications(notificationsClient)

        const interval = setInterval(() => {
          fetchAndUpdateNotifications(notificationsClient)
        }, NOTIFICATIONS_QUERY_INTERVAL)
        return () => clearInterval(interval)
      }
    } else {
      setNotificationsClient(null)
    }
    return () => {}
  }, [identity])

  useEffect(() => {
    const isClosing = !isOpen
    if (isClosing) {
      const unreadNotificationsIds: string[] = []
      for (const notification of notifications) {
        if (!notification.read) {
          unreadNotificationsIds.push(notification.id)
        }
      }
      if (unreadNotificationsIds.length && notificationsClient) {
        try {
          notificationsClient.markNotificationsAsRead(unreadNotificationsIds)
          setUserNotifications((prevState) => ({
            ...prevState,
            notifications: prevState.notifications.map((notification) => ({
              ...notification,
              read: unreadNotificationsIds.includes(notification.id)
                ? true
                : notification.read,
            })),
          }))
        } catch (error) {
          console.error('Error marking notifications as read:', error)
        }
      }
    }
  }, [isOpen])

  const handleNotificationsOpen = () => {
    setNotificationsState((prevState) => {
      return { ...prevState, isOpen: !prevState.isOpen }
    })
  }

  const handleOnChangeModalTab = (tab: NotificationActiveTab) =>
    setNotificationsState((prevState) => ({
      ...prevState,
      activeTab: tab,
    }))

  const handleRenderProfile = useCallback((address: string) => {
    return (
      <Profile
        address={address}
        as="a"
        href={`${getBaseUrl()}/profile/accounts/${address}`}
        style={{ fontWeight: 500, color: 'white', textDecoration: 'none' }}
        target="_blank"
      />
    )
  }, [])

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
    handleRenderProfile,
  }
}

export default useNotifications
