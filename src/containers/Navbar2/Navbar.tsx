import React, { useCallback } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { NetworkAlert } from 'decentraland-ui/dist/components/NetworkAlert/NetworkAlert'
import { ModalNavigation } from 'decentraland-ui/dist/components/ModalNavigation/ModalNavigation'
import { Navbar2 as NavbarComponent } from 'decentraland-ui/dist/components/Navbar2/Navbar2'
import { getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { getAnalytics } from '../../modules/analytics/utils'
import { t, T } from '../../modules/translation/utils'
import Modal from '../../containers/Modal'
import ChainProvider from '../ChainProvider'
import { NavbarProps } from './Navbar.types'

const Navbar: React.FC<NavbarProps> = ({
  appChainId,
  docsUrl = 'https://docs.decentraland.org',
  enablePartialSupportAlert = true,
  ...props
}: NavbarProps) => {
  const expectedChainName = getChainName(appChainId)
  const analytics = getAnalytics()

  const handleSwitchNetwork = useCallback(() => {
    props.onSwitchNetwork(appChainId)
  }, [])

  const handleClickSignOut = useCallback(() => {
    props.onSignOut()
  }, [])

  const handleClickNavbarItem = useCallback(
    (
      _e: React.MouseEvent,
      options: { eventTrackingName: string; url?: string; isExternal?: boolean }
    ) => {
      analytics.track(options.eventTrackingName, {
        url: options.url,
        isExternal: options.isExternal
      })
    },
    []
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
    []
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
              onClickNavbarItem={handleClickNavbarItem}
              onClickUserMenuItem={handleClickUserMenuItem}
              onClickSignOut={handleClickSignOut}
            />
            {isUnsupported ? (
              <Modal open size="tiny">
                <ModalNavigation
                  title={<T id="@dapps.navbar.wrong_network.header" />}
                />
                <Modal.Content>
                  {!getChainName(chainId!) ? (
                    <T
                      id="@dapps.navbar.wrong_network.message_unknown_network"
                      values={{
                        expectedChainName: <b>{expectedChainName}</b>
                      }}
                    />
                  ) : (
                    <T
                      id="@dapps.navbar.wrong_network.message"
                      values={{
                        currentChainName: <b>{getChainName(chainId!)}</b>,
                        expectedChainName: <b>{expectedChainName}</b>
                      }}
                    />
                  )}
                </Modal.Content>
                <Modal.Actions>
                  <Button primary onClick={handleSwitchNetwork}>
                    <T
                      id="@dapps.navbar.wrong_network.switch_button"
                      values={{
                        chainName: <b>{expectedChainName}</b>
                      }}
                    />
                  </Button>
                </Modal.Actions>
              </Modal>
            ) : null}
          </>
        )}
      </ChainProvider>
    </>
  )
}

export default React.memo(Navbar)
