import React, { useCallback, useEffect, useState } from 'react'
import { Navbar as NavbarComponent } from 'decentraland-ui/dist/components/Navbar/Navbar'
import {  NotificationLocale } from 'decentraland-ui/dist/components/Notifications/types'
import { ChainId, getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { ProviderType } from '@dcl/schemas'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { getAnalytics } from '../../modules/analytics/utils'
import { t } from '../../modules/translation'
import UnsupportedNetworkModal from '../UnsupportedNetworkModal'
import { getAvailableChains } from '../../lib/chainConfiguration'
import { getConnectedProviderType } from '../../lib'
import { getBaseUrl } from '../../lib/utils'
import ChainProvider from '../ChainProvider'
import {
  DROPDOWN_MENU_BALANCE_CLICK_EVENT,
  DROPDOWN_MENU_DISPLAY_EVENT,
  DROPDOWN_MENU_SIGN_OUT_EVENT
} from './constants'
import { NavbarProps } from './Navbar.types'
import { NAVBAR_CLICK_EVENT } from './constants'
import useNotifications from '../../hooks/useNotifications'

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
  const expectedChainName = getChainName(appChainId)
  const analytics = getAnalytics()

  const { 
    isModalOpen, 
    isNotificationsOnboarding, 
    modalActiveTab, 
    isLoading, 
    notifications, 
    handleNotificationsOpen, 
    handleOnBegin, 
    handleOnChangeModalTab 
  } = useNotifications(identity, withNotifications || false)

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
  }, [walletError, chainSelected, withChainSelector])

  const handleSwitchChain = useCallback(
    (chainId: ChainId) => {
      setChainSelected(chainId)
      props.onSwitchNetwork(chainId, props.chainId)
      analytics.track('change_network', {
        from_chain_id: props.chainId,
        to_chain_id: chainId
      })
    },
    [analytics]
  )

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
                      isOnboarding: isNotificationsOnboarding,
                      isOpen: isModalOpen,
                      items: notifications,
                      activeTab: modalActiveTab,
                      onClick: handleNotificationsOpen,
                      onClose: handleNotificationsOpen,
                      onBegin: handleOnBegin,
                      onChangeTab: (_, tab) => handleOnChangeModalTab(tab)
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
                onSelectChain: handleSwitchChain,
                i18nChainSelector: {
                  title: t('@dapps.chain_selector.title'),
                  connected: t('@dapps.chain_selector.connected'),
                  confirmInWallet:
                    getConnectedProviderType() === ProviderType.INJECTED // for injected ones, show label to confirm in wallet, the rest won't ask for confirmation
                      ? t('@dapps.chain_selector.confirm_in_wallet')
                      : t('@dapps.chain_selector.switching')
                }
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
