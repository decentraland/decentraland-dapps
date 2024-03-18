import { useMemo, useState, useEffect } from "react"
import { NotificationsAPI, checkIsOnboarding, setOnboardingDone } from "../modules/notifications"
import { AuthIdentity } from "decentraland-crypto-fetch"
import { DCLNotification, NotificationActiveTab } from "decentraland-ui/dist/components/Notifications/types"
import { NOTIFICATIONS_QUERY_INTERVAL } from "../containers/Navbar/constants"

const useNotifications = (identity: AuthIdentity | undefined, isNotificationsEnabled: boolean) => {
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
      const unreadNotifications = notifications
        .filter(notification => !notification.read)
        .map(({ id }) => id)
      if (unreadNotifications.length) {
        await notificationsClient?.markNotificationsAsRead(unreadNotifications)
      }
    } else {
      // update state when closes the modal
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
  }

  const handleOnChangeModalTab = (tab: NotificationActiveTab) => setNotificationsState(prevState => ({
    ...prevState,
    activeTab: tab
  }))

  const fetchNotificationsState = () => {
    setUserNotifications({ notifications: [], isLoading: true })
    notificationsClient?.getNotifications().then(retrievedNotifications => {
      setUserNotifications({
        isLoading: false,
        notifications: retrievedNotifications
      })
    })
  }

  useEffect(() => {
    if (identity && isNotificationsEnabled) {
      fetchNotificationsState()

      const interval = setInterval(() => {
        fetchNotificationsState()
      }, NOTIFICATIONS_QUERY_INTERVAL)

      return () => {
        clearInterval(interval)
      }
    } else {
      return () => {}
    }
  }, [identity])


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
  }
}

export default useNotifications