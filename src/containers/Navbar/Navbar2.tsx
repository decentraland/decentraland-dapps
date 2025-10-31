import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Navbar as NavbarComponent } from 'decentraland-ui2'
import { NotificationLocale } from 'decentraland-ui/dist/components/Notifications/types'
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
  CHANGE_NETWORK,
  NAVBAR_DOWNLOAD_EVENT,
  DROPDOWN_MENU_BALANCE_CLICK_EVENT,
  DROPDOWN_MENU_DISPLAY_EVENT,
  DROPDOWN_MENU_ITEM_CLICK_EVENT,
  DROPDOWN_MENU_SIGN_OUT_EVENT,
  NAVBAR_DOWNLOAD_EVENT_PLACE
} from './constants'
import { NavbarProps2 } from './Navbar.types'
import { NAVBAR_CLICK_EVENT } from './constants'
import useNotifications from '../../hooks/useNotifications'
import useSignInIdentity from '../../hooks/useSinginIdentity'
import {
  getCDNRelease,
  CDNSource
} from 'decentraland-ui2/dist/modules/cdnReleases'
import { NavbarContainer } from './Navbar2.styled'
import { ethers } from 'ethers'

const BASE_URL = getBaseUrl()

const Navbar2: React.FC<NavbarProps2> = ({
  appChainId,
  isSwitchingNetwork,
  withNotifications,
  withChainSelector,
  identity,
  docsUrl = 'https://docs.decentraland.org',
  enablePartialSupportAlert = true,
  walletError,
  cdnLinks,
  hideSignInButton,
  ...props
}: NavbarProps2) => {
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
    handleOnChangeModalTab,
    handleRenderProfile
  } = useNotifications(identity, withNotifications || false)

  const { identityId, createIdentityId } = useSignInIdentity(identity)

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
      analytics?.track(CHANGE_NETWORK, {
        from_chain_id: props.chainId,
        to_chain_id: chainId
      })
    },
    [analytics]
  )

  const handleClickBalance = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>,
      network?: Network
    ) => {
      e.preventDefault()
      analytics?.track(DROPDOWN_MENU_BALANCE_CLICK_EVENT, { network })

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
      analytics?.track(NAVBAR_CLICK_EVENT, options)
    },
    [analytics]
  )

  const handleClickUserMenuItem = useCallback(
    (
      _e: React.MouseEvent,
      options: { type: string; url?: string; track_uuid?: string }
    ) => {
      analytics?.track(DROPDOWN_MENU_ITEM_CLICK_EVENT, options)
    },
    [analytics]
  )

  const handleClickDownload = useCallback(
    (_e: React.MouseEvent, options: { href: string }) => {
      analytics?.track(NAVBAR_DOWNLOAD_EVENT, {
        ...options,
        place: NAVBAR_DOWNLOAD_EVENT_PLACE
      })
    },
    [analytics]
  )

  const handleClickOpen = useCallback(
    (_e: React.MouseEvent, track_uuid: string) => {
      analytics?.track(DROPDOWN_MENU_DISPLAY_EVENT, { track_uuid })
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
      analytics?.track(DROPDOWN_MENU_SIGN_OUT_EVENT, { track_uuid })
      setTimeout(() => {
        props.onSignOut()
      }, 300)
    },
    [analytics]
  )

  const creditsBalance = props.credits
    ? {
        balance: Number(
          ethers.utils.formatEther(props.credits?.totalCredits.toString() ?? 0)
        ),
        expiresAt: Number(props.credits?.credits[0]?.expiresAt * 1000) ?? 0
      }
    : undefined

  // Create identityId if we have identity and authChain
  useEffect(() => {
    if (
      identity &&
      !identityId &&
      identity.authChain &&
      identity.ephemeralIdentity
    ) {
      createIdentityId({
        authChain: identity.authChain,
        ephemeralIdentity: identity.ephemeralIdentity
      }).catch(error => {
        console.error('Failed to create identity ID:', error)
      })
    }
  }, [identity, identityId, createIdentityId])

  // Generate CDN links using the identityId (from props or generated)
  const generatedCdnLinks = useMemo(() => {
    return identityId
      ? getCDNRelease(CDNSource.AUTO_SIGNING, identityId)
      : getCDNRelease(CDNSource.LAUNCHER)
  }, [identityId])

  const finalCdnLinks =
    cdnLinks ||
    (generatedCdnLinks as Record<string, Record<string, string>> | undefined)

  return (
    <NavbarContainer>
      <ChainProvider>
        {({ chainId, isUnsupported }) => (
          <>
            <NavbarComponent
              {...props}
              creditsBalance={creditsBalance}
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
                      onChangeTab: (_, tab) => handleOnChangeModalTab(tab),
                      renderProfile: handleRenderProfile
                    }
                  : undefined
              }
              cdnLinks={finalCdnLinks}
              identityId={identityId || undefined}
              hideSignInButton={hideSignInButton}
              onClickBalance={handleClickBalance}
              onClickNavbarItem={handleClickNavbarItem}
              onClickUserMenuItem={handleClickUserMenuItem}
              onClickOpen={handleClickOpen}
              onClickSignIn={handleClickSignIn}
              onClickSignOut={handleClickSignOut}
              onClickDownload={handleClickDownload}
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
    </NavbarContainer>
  )
}

export default React.memo(Navbar2)
