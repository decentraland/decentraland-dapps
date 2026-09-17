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
  withCredits = true,
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

  /**
   * Legacy MANA-denominated credits. Left as an object at a ZERO balance this renders a chip announcing a
   * programme that is no longer issued, with a tooltip reading "Expiring in 0 days (1 Credit = 1 MANA in
   * value)" — an expiry computed from the `expiresAt: 0` fallback below, because there is no credit to take
   * a date from. The navbar treats the object as the "has credits" signal (`creditsBalance && ...`), and
   * the client answers `{ credits: [], totalCredits: 0 }` both for a wallet with none and for a failed
   * request, so every signed-in user got the chip.
   *
   * Undefined at zero, therefore: the chip belongs to wallets that actually hold some and can still spend
   * them. This is deliberately not `withCredits`, which the apps use to opt out of BOTH balances — the USD
   * one below is a live programme and says something true at zero.
   */
  const creditsBalance = useMemo(
    () =>
      credits && Number(credits.totalCredits) > 0
        ? {
            balance: Number(formatEther(credits.totalCredits.toString() ?? 0)),
            expiresAt: credits.credits[0]?.expiresAt ? Number(credits.credits[0].expiresAt * 1000) : 0
          }
        : undefined,
    [credits]
  )

  // Shop (USD-pegged) credits come in the same credits-server response; whole credits, no expiry.
  const shopCreditsBalance = credits?.usd ? credits.usd.credits : undefined

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
              creditsBalance={withCredits ? creditsBalance : undefined}
              shopCreditsBalance={withCredits ? shopCreditsBalance : undefined}
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
