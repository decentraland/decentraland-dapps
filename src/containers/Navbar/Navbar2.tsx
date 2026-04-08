import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatEther } from '@ethersproject/units'
import { ChainId, getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import {
  Navbar as NavbarComponent,
  BellButton,
  NotificationBadge,
  NotificationEmpty,
  NotificationHeader,
  NotificationList,
  NotificationPanel,
  NotificationTitle,
  NotificationWrapper
} from 'decentraland-ui2'
import { NotificationComponentByType } from 'decentraland-ui2/dist/components/Notifications/utils'
import { BellIcon } from 'decentraland-ui2/dist/components/Navbar/icons'
import type { NotificationLocale } from 'decentraland-ui2'
import useNotifications from '../../hooks/useNotifications'
import { getAvailableChains } from '../../lib/chainConfiguration'
import { getBaseUrl } from '../../lib/utils'
import { getAnalytics } from '../../modules/analytics/utils'
import ChainProvider from '../ChainProvider'
import UnsupportedNetworkModal from '../UnsupportedNetworkModal'
import {
  CHANGE_NETWORK,
  DROPDOWN_MENU_BALANCE_CLICK_EVENT,
  DROPDOWN_MENU_SIGN_OUT_EVENT
} from './constants'
import { NavbarProps2 } from './Navbar.types'
import { NavbarContainer } from './Navbar2.styled'

const BASE_URL = getBaseUrl()

const NotificationSlot: React.FC<{
  locale: string
  notifications: any[]
  isLoading: boolean
  isOpen: boolean
  onToggle: () => void
  renderProfile?: (address: string) => JSX.Element | string | null
}> = ({ locale, notifications, isLoading, isOpen, onToggle, renderProfile }) => {
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  return (
    <NotificationWrapper>
      <BellButton onClick={onToggle} className={unreadCount > 0 ? 'has-unread' : ''}>
        <BellIcon />
        {unreadCount > 0 && <NotificationBadge>{unreadCount > 99 ? '99+' : unreadCount}</NotificationBadge>}
      </BellButton>
      {isOpen && (
        <NotificationPanel>
          <NotificationHeader>
            <NotificationTitle>Notifications</NotificationTitle>
          </NotificationHeader>
          <NotificationList>
            {isLoading && notifications.length === 0 && <NotificationEmpty>Loading...</NotificationEmpty>}
            {!isLoading && notifications.length === 0 && <NotificationEmpty>No notifications yet</NotificationEmpty>}
            {notifications.map(notification => {
              const Component = NotificationComponentByType[notification.type as keyof typeof NotificationComponentByType]
              if (!Component) return null
              return (
                <Component
                  key={notification.id}
                  notification={notification}
                  locale={locale as NotificationLocale}
                  renderProfile={renderProfile}
                />
              )
            })}
          </NotificationList>
        </NotificationPanel>
      )}
    </NotificationWrapper>
  )
}

const Navbar2: React.FC<NavbarProps2> = ({
  appChainId,
  isSwitchingNetwork,
  withNotifications,
  withChainSelector,
  identity,
  enablePartialSupportAlert: _enablePartialSupportAlert = true,
  walletError,
  credits,
  locale,
  chainId,
  onSwitchNetwork,
  onSignIn,
  onSignOut,
  ...navbarProps
}: NavbarProps2) => {
  const expectedChainName = getChainName(appChainId)
  const analytics = getAnalytics()

  const {
    isModalOpen,
    isLoading,
    notifications,
    handleNotificationsOpen,
    handleRenderProfile
  } = useNotifications(identity, withNotifications || false)

  const handleSwitchNetwork = useCallback(() => {
    onSwitchNetwork(appChainId)
  }, [])

  const [chainSelected, setChainSelected] = useState<ChainId | undefined>(undefined)

  useEffect(() => {
    if (walletError && chainSelected && withChainSelector) {
      setChainSelected(undefined)
    }
  }, [walletError, chainSelected, withChainSelector])

  const handleSwitchChain = useCallback(
    (selectedChain: ChainId) => {
      setChainSelected(selectedChain)
      onSwitchNetwork(selectedChain, chainId)
      analytics?.track(CHANGE_NETWORK, {
        from_chain_id: chainId,
        to_chain_id: selectedChain
      })
    },
    [analytics, chainId, onSwitchNetwork]
  )

  const handleClickBalance = useCallback(
    (network: Network) => {
      analytics?.track(DROPDOWN_MENU_BALANCE_CLICK_EVENT, { network })
      setTimeout(() => {
        window.open(`${BASE_URL}/account`, '_blank', 'noopener')
      }, 300)
    },
    [analytics]
  )

  const handleClickSignIn = useCallback(() => {
    onSignIn()
  }, [onSignIn])

  const handleClickSignOut = useCallback(() => {
    analytics?.track(DROPDOWN_MENU_SIGN_OUT_EVENT, {})
    setTimeout(() => {
      onSignOut()
    }, 300)
  }, [analytics, onSignOut])

  const creditsBalance = credits
    ? {
        balance: Number(formatEther(credits?.totalCredits.toString() ?? 0)),
        expiresAt: credits?.credits[0]?.expiresAt ? Number(credits.credits[0].expiresAt * 1000) : 0
      }
    : undefined

  const notificationSlot = withNotifications ? (
    <NotificationSlot
      locale={locale}
      notifications={notifications}
      isLoading={isLoading}
      isOpen={isModalOpen}
      onToggle={handleNotificationsOpen}
      renderProfile={handleRenderProfile}
    />
  ) : undefined

  return (
    <NavbarContainer>
      <ChainProvider>
        {({ chainId: currentChainId, isUnsupported }) => (
          <>
            <NavbarComponent
              {...navbarProps}
              creditsBalance={creditsBalance}
              notificationSlot={notificationSlot}
              onClickSignIn={handleClickSignIn}
              onClickSignOut={handleClickSignOut}
              onClickBalance={handleClickBalance}
              onToggleUserCard={isOpen => {
                if (isOpen && isModalOpen) {
                  handleNotificationsOpen()
                }
              }}
              {...(withChainSelector && {
                chains: getAvailableChains(),
                selectedChain: currentChainId ?? undefined,
                onSelectChain: handleSwitchChain
              })}
            />
            {isUnsupported ? (
              <UnsupportedNetworkModal
                chainName={getChainName(currentChainId!)}
                expectedChainName={expectedChainName!}
                isSwitchingNetwork={isSwitchingNetwork}
                onSwitchNetwork={handleSwitchNetwork}
              />
            ) : null}
          </>
        )}
      </ChainProvider>
    </NavbarContainer>
  )
}

export default React.memo(Navbar2)
