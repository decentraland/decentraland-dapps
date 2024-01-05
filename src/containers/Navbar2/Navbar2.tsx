import React, { useCallback } from 'react'

import { NetworkAlert } from 'decentraland-ui/dist/components/NetworkAlert/NetworkAlert'
import { Navbar2 as NavbarComponent } from 'decentraland-ui/dist/components/Navbar2/Navbar2'
import { getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { getAnalytics } from '../../modules/analytics/utils'
import { t } from '../../modules/translation/utils'
import { getBaseUrl } from '../../lib/utils'
import ChainProvider from '../ChainProvider'
import {
  DROPDOWN_MENU_BALANCE_CLICK_EVENT,
  DROPDOWN_MENU_DISPLAY_EVENT,
  DROPDOWN_MENU_SIGN_OUT_EVENT
} from '../UserInformation/constants'
import { Navbar2Props } from './Navbar2.types'
import { NAVBAR_CLICK_EVENT } from './constants'
import UnsupportedNetworkModal from '../UnsupportedNetworkModal'

const BASE_URL = getBaseUrl()

const Navbar2: React.FC<Navbar2Props> = ({
  appChainId,
  docsUrl = 'https://docs.decentraland.org',
  enablePartialSupportAlert = true,
  isSwitchingNetwork,
  ...props
}: Navbar2Props) => {
  const expectedChainName = getChainName(appChainId)
  const analytics = getAnalytics()

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
