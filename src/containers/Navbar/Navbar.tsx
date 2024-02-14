import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Navbar as NavbarComponent } from 'decentraland-ui/dist/components/Navbar/Navbar'
import {
  DCLNotification,
  NotificationActiveTab,
  NotificationLocale
} from 'decentraland-ui/dist/components/Notifications/types'
import { ChainId, getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { getAnalytics } from '../../modules/analytics/utils'
import {
  NotificationsAPI,
  checkIsOnboarding,
  setOnboardingDone
} from '../../modules/notifications'
import { getBaseUrl } from '../../lib/utils'
import ChainProvider from '../ChainProvider'
import {
  DROPDOWN_MENU_BALANCE_CLICK_EVENT,
  DROPDOWN_MENU_DISPLAY_EVENT,
  DROPDOWN_MENU_SIGN_OUT_EVENT
} from './constants'
import { NavbarProps } from './Navbar.types'
import { NAVBAR_CLICK_EVENT, NOTIFICATIONS_QUERY_INTERVAL } from './constants'
import UnsupportedNetworkModal from '../UnsupportedNetworkModal'
import { getAvailableChains } from '../../lib/chainConfiguration'

const BASE_URL = getBaseUrl()

const Navbar: React.FC<NavbarProps> = ({
  appChainId,
  isSwitchingNetwork,
  withNotifications,
  withChainSelector,
  identity,
  docsUrl = 'https://docs.decentraland.org',
  enablePartialSupportAlert = true,
  walletError,
  ...props
}: NavbarProps) => {
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
  const client: NotificationsAPI | null = useMemo(() => {
    if (identity) return new NotificationsAPI({ identity })
    return null
  }, [identity])

  const handleSwitchNetwork = useCallback(() => {
    props.onSwitchNetwork(appChainId)
  }, [])

  const [chainSelected, setChainSelected] = useState<ChainId | undefined>(
    undefined
  )

  useEffect(() => {
    if (walletError && chainSelected && withChainSelector) {
      setChainSelected(undefined)
    }
  }, [walletError, withChainSelector])

  const handleSwitchChain = useCallback((chainId: ChainId) => {
    setChainSelected(chainId)
    props.onSwitchNetwork(chainId)
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
        {({ chainId, isUnsupported }) => (
          <>
            <NavbarComponent
              {...props}
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
              onClickBalance={handleClickBalance}
              onClickNavbarItem={handleClickNavbarItem}
              onClickUserMenuItem={handleClickUserMenuItem}
              onClickOpen={handleClickOpen}
              onClickSignIn={handleClickSignIn}
              onClickSignOut={handleClickSignOut}
              {...(withChainSelector && {
                chains: getAvailableChains(),
                selectedChain: chainId ?? undefined,
                chainBeingConfirmed:
                  chainSelected !== chainId ? chainSelected : undefined,
                onSelectChain: handleSwitchChain
              })}
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

export default React.memo(Navbar)
