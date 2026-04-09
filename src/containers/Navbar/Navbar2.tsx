import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatEther } from '@ethersproject/units'
import { ChainId, getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { Navbar as NavbarComponent } from 'decentraland-ui2'
import useNotifications from '../../hooks/useNotifications'
import { getAvailableChains } from '../../lib/chainConfiguration'
import { getBaseUrl } from '../../lib/utils'
import { getAnalytics } from '../../modules/analytics/utils'
import ChainProvider from '../ChainProvider'
import UnsupportedNetworkModal from '../UnsupportedNetworkModal'
import { CHANGE_NETWORK, DROPDOWN_MENU_BALANCE_CLICK_EVENT, DROPDOWN_MENU_SIGN_OUT_EVENT } from './constants'
import NotificationSlot from './NotificationSlot'
import { NavbarProps2 } from './Navbar.types'
import { NavbarContainer } from './Navbar2.styled'

const BASE_URL = getBaseUrl()

const Navbar2: React.FC<NavbarProps2> = ({
  appChainId,
  isSwitchingNetwork,
  withNotifications,
  withChainSelector,
  identity,
  walletError,
  credits,
  locale,
  chainId,
  manaBalances,
  onSwitchNetwork,
  onSignIn,
  onSignOut,
  ...navbarProps
}: NavbarProps2) => {
  const expectedChainName = getChainName(appChainId)
  const analytics = getAnalytics()

  const hasMana = !!manaBalances && Object.values(manaBalances).some(b => b !== undefined && b > 0)

  const { isModalOpen, isLoading, notifications, handleNotificationsOpen, handleRenderProfile } = useNotifications(
    identity,
    withNotifications || false
  )

  const handleSwitchNetwork = useCallback(() => {
    onSwitchNetwork(appChainId)
  }, [onSwitchNetwork, appChainId])

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

  const handleClickSignOut = useCallback(() => {
    analytics?.track(DROPDOWN_MENU_SIGN_OUT_EVENT, {})
    setTimeout(() => {
      onSignOut()
    }, 300)
  }, [analytics, onSignOut])

  const creditsBalance = useMemo(
    () =>
      credits
        ? {
            balance: Number(formatEther(credits.totalCredits.toString() ?? 0)),
            expiresAt: credits.credits[0]?.expiresAt ? Number(credits.credits[0].expiresAt * 1000) : 0
          }
        : undefined,
    [credits]
  )

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
              manaBalances={hasMana ? manaBalances : undefined}
              onClickBalance={hasMana ? handleClickBalance : undefined}
              chains={withChainSelector ? getAvailableChains() : undefined}
              selectedChain={withChainSelector ? (currentChainId ?? undefined) : undefined}
              onSelectChain={withChainSelector ? handleSwitchChain : undefined}
              onClickSignIn={onSignIn}
              onClickSignOut={handleClickSignOut}
              onToggleUserCard={isOpen => {
                if (isOpen && isModalOpen) {
                  handleNotificationsOpen()
                }
              }}
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
