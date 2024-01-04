import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MenuItemType,
  UserInformationContainer as UserMenuComponent
} from 'decentraland-ui/dist/components/UserInformationContainer/UserInformationContainer'
import {
  DCLNotification,
  NotificationActiveTab,
  NotificationLocale
} from 'decentraland-ui/dist/components/Notifications/types'

import { getAnalytics } from '../../modules/analytics/utils'
import { t } from '../../modules/translation/utils'
import { UserInformationProps } from './UserInformation.types'
import {
  DROPDOWN_MENU_BALANCE_CLICK_EVENT,
  DROPDOWN_MENU_DISPLAY_EVENT,
  DROPDOWN_MENU_ITEM_CLICK_EVENT,
  DROPDOWN_MENU_SIGN_IN_EVENT,
  DROPDOWN_MENU_SIGN_OUT_EVENT
} from './constants'
import {
  NotificationsAPI,
  checkIsOnboarding,
  setOnboardingDone
} from '../../modules/notifications'

const NOTIFICATIONS_QUERY_INTERVAL = 60000

export const UserInformation = (props: UserInformationProps) => {
  const analytics = getAnalytics()

  const {
    hasTranslations,
    onSignOut,
    onSignIn,
    onOpen,
    onClickBalance,
    withNotifications,
    identity,
    ...rest
  } = props

  const [{ isLoading, notifications }, setUserNotifications] = useState<{
    isLoading: boolean
    notifications: DCLNotification[]
  }>({
    isLoading: false,
    notifications: []
  })
  const [notificationsState, setNotificationsState] = useState({
    activeTab: NotificationActiveTab.NEWEST,
    isOnboarding: checkIsOnboarding(),
    isOpen: false
  })

  let client: NotificationsAPI
  if (identity) {
    client = new NotificationsAPI({ identity })
  }

  const translations = useMemo(() => {
    if (!props.hasTranslations) {
      return undefined
    }
    return {
      signIn: t('@dapps.user_menu.sign_in'),
      signOut: t('@dapps.user_menu.sign_out'),
      guest: t('@dapps.user_menu.guest'),
      settings: t('@dapps.user_menu.settings'),
      wallet: t('@dapps.user_menu.wallet'),
      profile: t('@dapps.user_menu.profile'),
      myAssets: t('@dapps.user_menu.my_assets'),
      myLists: t('@dapps.user_menu.my_lists')
    }
  }, [hasTranslations])

  const trackMenuItemClick = useCallback(
    (type: MenuItemType, track_uuid: string) => {
      if (analytics) {
        analytics.track(DROPDOWN_MENU_ITEM_CLICK_EVENT, {
          type,
          track_uuid
        })
      }
    },
    [analytics]
  )

  const handleOpen = useCallback(
    (track_uuid: string) => {
      if (analytics) {
        analytics.track(DROPDOWN_MENU_DISPLAY_EVENT, { track_uuid })
      }
      if (onOpen) {
        onOpen(track_uuid)
      }
    },
    [analytics, onOpen]
  )

  const handleClickBalance = useCallback(
    network => {
      if (analytics) {
        analytics.track(DROPDOWN_MENU_BALANCE_CLICK_EVENT, { network })
      }
      if (onClickBalance) {
        setTimeout(() => {
          onClickBalance(network)
        }, 300)
      }
    },
    [analytics, onClickBalance]
  )

  const handleSignOut = useCallback(
    (track_uuid: string) => {
      if (analytics) {
        analytics.track(DROPDOWN_MENU_SIGN_OUT_EVENT, { track_uuid })
      }
      if (onSignOut) {
        setTimeout(() => {
          onSignOut(track_uuid)
        }, 300)
      }
    },
    [analytics, onSignOut]
  )

  const handleSignIn = useCallback(() => {
    if (analytics) {
      analytics.track(DROPDOWN_MENU_SIGN_IN_EVENT)
    }
    if (onSignIn) {
      setTimeout(() => {
        onSignIn()
      }, 300)
    }
  }, [analytics, onSignIn])

  const fetchNotificationsState = () => {
    setUserNotifications({ notifications: [], isLoading: true })
    client.getNotifications().then(retrievedNotifications => {
      setUserNotifications({
        isLoading: false,
        notifications: retrievedNotifications
      })
    })
  }

  const handleNotificationsOpen = async () => {
    const currentOpenState = notificationsState.isOpen

    setNotificationsState(prevState => {
      return { ...prevState, isOpen: !prevState.isOpen }
    })

    if (!currentOpenState) {
      const unreadNotifications = notifications
        .filter(notification => !notification.read)
        .map(({ id }) => id)
      if (unreadNotifications.length) {
        await client.markNotificationsAsRead(unreadNotifications)
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

  const handleOnBegin = () => {
    setOnboardingDone()
    setNotificationsState(prevState => ({ ...prevState, isOnboarding: false }))
  }

  useEffect(() => {
    if (identity && withNotifications) {
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

  return (
    <UserMenuComponent
      notifications={
        withNotifications
          ? {
              locale: props.locale as NotificationLocale,
              isLoading,
              isOnboarding: notificationsState.isOnboarding,
              isOpen: notificationsState.isOpen,
              items: notifications,
              activeTab: notificationsState.activeTab,
              onClick: handleNotificationsOpen,
              onClose: handleNotificationsOpen,
              onBegin: handleOnBegin,
              onChangeTab: (_, tab) =>
                setNotificationsState(prevState => ({
                  ...prevState,
                  activeTab: tab
                }))
            }
          : undefined
      }
      onSignOut={handleSignOut}
      onSignIn={handleSignIn}
      onClickBalance={handleClickBalance}
      onOpen={handleOpen}
      onMenuItemClick={trackMenuItemClick}
      {...rest}
      i18n={translations}
    />
  )
}
