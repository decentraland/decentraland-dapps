import React from 'react'
import { useMemo, useState, useEffect, useCallback } from 'react'
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

  const [{ activeTab, isOnboarding, isOpen }, setNotificationsState] = useState(
    {
      activeTab: NotificationActiveTab.NEWEST,
      isOnboarding: checkIsOnboarding(),
      isOpen: false
    }
  )

  const notificationsClient: NotificationsAPI | null = useMemo(() => {
    if (identity) return new NotificationsAPI({ identity })
    return null
  }, [identity])

  const handleOnBegin = () => {
    setOnboardingDone()
    setNotificationsState(prevState => ({ ...prevState, isOnboarding: false }))
  }

  const handleNotificationsOpen = async () => {
    const currentOpenState = isOpen

    setNotificationsState(prevState => {
      return { ...prevState, isOpen: !prevState.isOpen }
    })

    if (!currentOpenState) {
      try {
        const unreadNotifications = notifications
          .filter(notification => !notification.read)
          .map(({ id }) => id)
        
        if (unreadNotifications.length) {
          await notificationsClient?.markNotificationsAsRead(unreadNotifications)
          
          // update local state after successful API call
          const markNotificationAsReadInState = notifications.map(notification => {
            if (notification.read) return notification
            return {
              ...notification,
              read: true
            }
          })
          setUserNotifications({
            isLoading,
            notifications: markNotificationAsReadInState
          })
        }
      } catch (error) {
        console.error('Failed to mark notifications as read:', error)
        // refresh notifications state by fetching the server if something went wrong
        fetchNotificationsState()
      }
    }
  }

  const handleOnChangeModalTab = (tab: NotificationActiveTab) =>
    setNotificationsState(prevState => ({
      ...prevState,
      activeTab: tab
    }))

  const fetchNotificationsState = useCallback(() => {
    setUserNotifications({ notifications: [], isLoading: true })
    notificationsClient?.getNotifications().then(retrievedNotifications => {
      const filteredNotifications = retrievedNotifications.filter(notification =>
        CURRENT_AVAILABLE_NOTIFICATIONS.includes(notification.type)
      )
      setUserNotifications({
        isLoading: false,
        notifications: filteredNotifications
      })
    }).catch(error => {
      console.error('Failed to fetch notifications:', error)
    })
  }, [notificationsClient])

  useEffect(() => {
    if (identity && isNotificationsEnabled) {
      fetchNotificationsState()

      const interval = setInterval(() => {
        fetchNotificationsState()
      }, NOTIFICATIONS_QUERY_INTERVAL)

      return () => {
        clearInterval(interval)
      }
    }

    return () => {}
  }, [identity, isNotificationsEnabled, fetchNotificationsState])

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

  useEffect(() => {
    console.log('Debug - Notifications state changed:', notifications)
  }, [notifications])

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
