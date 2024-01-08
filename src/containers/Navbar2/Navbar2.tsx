import React, { useCallback, useEffect, useState } from 'react'

import { NetworkAlert } from 'decentraland-ui/dist/components/NetworkAlert/NetworkAlert'
import { Navbar2 as NavbarComponent } from 'decentraland-ui/dist/components/Navbar2/Navbar2'
import {
  DCLNotification,
  NotificationActiveTab,
  NotificationLocale
} from 'decentraland-ui/dist/components/Notifications/types'
import { getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { getAnalytics } from '../../modules/analytics/utils'
import {
  NotificationsAPI,
  checkIsOnboarding,
  setOnboardingDone
} from '../../modules/notifications'
import { t } from '../../modules/translation/utils'
import { getBaseUrl } from '../../lib/utils'
import ChainProvider from '../ChainProvider'
import {
  DROPDOWN_MENU_BALANCE_CLICK_EVENT,
  DROPDOWN_MENU_DISPLAY_EVENT,
  DROPDOWN_MENU_SIGN_OUT_EVENT
} from '../UserInformation/constants'
import { Navbar2Props } from './Navbar2.types'
import { NAVBAR_CLICK_EVENT, NOTIFICATIONS_QUERY_INTERVAL } from './constants'
import UnsupportedNetworkModal from '../UnsupportedNetworkModal'

const BASE_URL = getBaseUrl()

const Navbar2: React.FC<Navbar2Props> = ({
  appChainId,
  isSwitchingNetwork,
  withNotifications,
  identity,
  docsUrl = 'https://docs.decentraland.org',
  enablePartialSupportAlert = true,
  ...props
}: Navbar2Props) => {
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
  const expectedChainName = getChainName(appChainId)
  const analytics = getAnalytics()
  const client: NotificationsAPI | null = identity
    ? new NotificationsAPI({ identity })
    : null

  const handleSwitchNetwork = useCallback(() => {
    props.onSwitchNetwork(appChainId)
  }, [])

  const handleClickBalance = useCallback(
    (e: React.MouseEvent, network: Network) => {
      e.preventDefault()
      analytics.track(DROPDOWN_MENU_BALANCE_CLICK_EVENT, { network })

      setTimeout(() => {
        window.open(`${BASE_URL}/account`, '_blank', 'noopener')
      }, 300)
    },
    [analytics]
  )

  const handleClickNavbarItem = useCallback(
    (
      _e: React.MouseEvent,
      options: { eventTrackingName: string; url?: string; isExternal?: boolean }
    ) => {
      analytics.track(NAVBAR_CLICK_EVENT, options)
    },
    [analytics]
  )

  const handleClickUserMenuItem = useCallback(
    (
      _e: React.MouseEvent,
      options: { eventTrackingName: string; url?: string; trackingId?: string }
    ) => {
      analytics.track(options.eventTrackingName, {
        url: options.url,
        trackingId: options.trackingId
      })
    },
    [analytics]
  )

  const handleClickOpen = useCallback(
    (_e: React.MouseEvent, track_uuid: string) => {
      analytics.track(DROPDOWN_MENU_DISPLAY_EVENT, { track_uuid })
    },
    [analytics]
  )

  const handleClickSignIn = useCallback(
    (_e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      props.onSignIn()
    },
    [analytics]
  )

  const handleClickSignOut = useCallback(
    (_e: React.MouseEvent<HTMLElement, MouseEvent>, track_uuid: string) => {
      analytics.track(DROPDOWN_MENU_SIGN_OUT_EVENT, { track_uuid })
      setTimeout(() => {
        props.onSignOut()
      }, 300)
    },
    [analytics]
  )

  const handleOnBegin = () => {
    setOnboardingDone()
    setNotificationsState(prevState => ({ ...prevState, isOnboarding: false }))
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
        await client?.markNotificationsAsRead(unreadNotifications)
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

  const fetchNotificationsState = () => {
    setUserNotifications({ notifications: [], isLoading: true })
    client?.getNotifications().then(retrievedNotifications => {
      setUserNotifications({
        isLoading: false,
        notifications: retrievedNotifications
      })
    })
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
    <>
      <ChainProvider>
        {({ chainId, isUnsupported, isPartiallySupported }) => (
          <>
            {isPartiallySupported && enablePartialSupportAlert ? (
              <NetworkAlert
                i18n={{
                  title: t('@dapps.network_alert.title'),
                  content: t('@dapps.network_alert.content', {
                    link: (children: React.ReactElement) => (
                      <a
                        href={`${docsUrl}/player/blockchain-integration/transactions-in-polygon/`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {children}
                      </a>
                    )
                  }),
                  action: t('@dapps.network_alert.action')
                }}
                onSwitchNetwork={handleSwitchNetwork}
              />
            ) : null}
            <NavbarComponent
              {...props}
              notifications={
                withNotifications
                  ? {
                      locale: 'en' as NotificationLocale,
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
              onClickBalance={handleClickBalance}
              onClickNavbarItem={handleClickNavbarItem}
              onClickUserMenuItem={handleClickUserMenuItem}
              onClickOpen={handleClickOpen}
              onClickSignIn={handleClickSignIn}
              onClickSignOut={handleClickSignOut}
            />
            {isUnsupported ? (
              <UnsupportedNetworkModal
                chainName={getChainName(chainId!)}
                expectedChainName={expectedChainName!}
                isSwitchingNetwork={isSwitchingNetwork}
                onSwitchNetwork={handleSwitchNetwork}
              />
            ) : null}
          </>
        )}
      </ChainProvider>
    </>
  )
}

export default React.memo(Navbar2)
