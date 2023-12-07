import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { diff } from 'radash/dist/array'
import {
  MenuItemType,
  UserInformationContainer as UserMenuComponent
} from 'decentraland-ui/dist/components/UserInformationContainer/UserInformationContainer'
import { DCLNotification, NotificationActiveTab, NotificationLocale } from 'decentraland-ui/dist/components/Notifications/types'

import { getAnalytics } from '../../modules/analytics/utils'
import { t } from '../../modules/translation/utils'
import { Props } from './UserInformation.types'
import {
  DROPDOWN_MENU_BALANCE_CLICK_EVENT,
  DROPDOWN_MENU_DISPLAY_EVENT,
  DROPDOWN_MENU_ITEM_CLICK_EVENT,
  DROPDOWN_MENU_SIGN_IN_EVENT,
  DROPDOWN_MENU_SIGN_OUT_EVENT
} from './constants'
import { NotificationsAPI, checkIsOnboarding, parseNotification} from '../../modules/notifications'

export const UserInformation = (props: Props) => {
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

  const [{ isLoading, notifications }, setUserNotifications] = useState<{ notifications: DCLNotification[], isLoading: boolean}>({
    isLoading: false,
    notifications: []
  })
  const [notificationsState, setNotificationsState] = useState({
    activeTab: NotificationActiveTab.NEWEST,
    isLoading: false,
    isOnboarding: checkIsOnboarding(),
    isOpen: false,
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
      myAssets: t('@dapps.user_menu.myAssets'),
      myLists: t('@dapps.user_menu.myLists')
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
    setUserNotifications({ notifications, isLoading: true })
    client.getNotifications(50)
    .then((response) => {
      const parsed = response.notifications.map(parseNotification)

      // check if needed to update notifications state
      if(diff(notifications, parsed).length) {
        setUserNotifications({ isLoading: false, notifications: parsed })
      } else {
        setUserNotifications({ notifications, isLoading: false })
      }
    })
  }

  const handleNotificationsOpen = async () => {
    const currentOpenState = notificationsState.isOpen
    
    setNotificationsState({ ...notificationsState, isOpen: !currentOpenState})
    
    if (!currentOpenState) {
      const unreadNotifications = notifications.filter((notification) => !notification.read).map(({ id }) => id)
      if (unreadNotifications.length) {
        await client.markNotificationsAsRead(unreadNotifications)
      }
    }
  }

  useEffect(() => {
    if (identity && withNotifications) {
      fetchNotificationsState()
    }
  }, [identity])


  useEffect(() => {
    if (identity && withNotifications) {
      const interval = setInterval(() => {
        fetchNotificationsState()
      }, 60000)
  
      return () => {
        clearInterval(interval)
      }
    } else {
      return () => {}
    }
  }, [identity, notifications])

  return (
    <UserMenuComponent
      notifications={
        withNotifications ? {
          locale: props.locale as NotificationLocale,
          isLoading,
          isOnboarding: notificationsState.isOnboarding,
          isOpen: notificationsState.isOpen,
          items: notifications,
          activeTab: notificationsState.activeTab,
          onClick: handleNotificationsOpen,
          onClose: handleNotificationsOpen,
          onBegin: () => setNotificationsState({ ...notificationsState, isOnboarding: false }),
          onChangeTab: (_, tab) => setNotificationsState({  ...notificationsState, activeTab: tab }),
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
