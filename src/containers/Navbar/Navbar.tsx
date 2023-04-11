import * as React from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { NetworkAlert } from 'decentraland-ui/dist/components/NetworkAlert/NetworkAlert'
import { ModalNavigation } from 'decentraland-ui/dist/components/ModalNavigation/ModalNavigation'
import {
  Navbar as NavbarComponent,
  NavbarI18N
} from 'decentraland-ui/dist/components/Navbar/Navbar'
import { getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import { t, T } from '../../modules/translation/utils'
import Modal from '../../containers/Modal'
import ChainProvider from '../ChainProvider'
import { NavbarProps } from './Navbar.types'

export default class Navbar extends React.PureComponent<NavbarProps> {
  static defaultProps = {
    docsUrl: 'https://docs.decentraland.org',
    enablePartialSupportAlert: true
  }

  getTranslations = (): NavbarI18N | undefined => {
    if (!this.props.hasTranslations) {
      return undefined
    }
    return {
      menu: {
        marketplace: {
          main: <T id="@dapps.navbar.menu.marketplace.main" />,
          overview: <T id="@dapps.navbar.menu.marketplace.overview" />,
          collectibles: <T id="@dapps.navbar.menu.marketplace.collectibles" />,
          land: <T id="@dapps.navbar.menu.marketplace.land" />,
          myAssets: <T id="@dapps.navbar.menu.marketplace.myAssets" />
        },
        events: <T id="@dapps.navbar.menu.events" />,
        places: {
          main: <T id="@dapps.navbar.menu.places.main" />,
          overview: <T id="@dapps.navbar.menu.places.overview" />,
          allPlaces: <T id="@dapps.navbar.menu.places.allPlaces" />,
          faq: <T id="@dapps.navbar.menu.places.faq" />
        },
        agora: <T id="@dapps.navbar.menu.agora" />,
        dao: {
          main: <T id="@dapps.navbar.menu.dao.main" />,
          list: <T id="@dapps.navbar.menu.dao.list" />
        },
        docs: {
          main: <T id="@dapps.navbar.menu.docs.main" />,
          players: <T id="@dapps.navbar.menu.docs.players" />,
          creators: <T id="@dapps.navbar.menu.docs.creators" />,
          contributors: <T id="@dapps.navbar.menu.docs.contributors" />,
          studios: <T id="@dapps.navbar.menu.docs.studios" />
        },
        blog: <T id="@dapps.navbar.menu.blog" />,
        builder: {
          main: <T id="@dapps.navbar.menu.builder.main" />,
          overview: <T id="@dapps.navbar.menu.builder.overview" />,
          collections: <T id="@dapps.navbar.menu.builder.collections" />,
          scenes: <T id="@dapps.navbar.menu.builder.scenes" />,
          land: <T id="@dapps.navbar.menu.builder.land" />,
          names: <T id="@dapps.navbar.menu.builder.names" />
        }
      },
      account: {
        connecting: <T id="@dapps.navbar.account.connecting" />,
        signIn: <T id="@dapps.navbar.account.signIn" />
      }
    }
  }

  handleSwitchNetwork = () => {
    this.props.onSwitchNetwork(this.props.appChainId)
  }

  handleSignOut = () => {
    this.props.onSignOut()
  }

  render() {
    const { appChainId, docsUrl, enablePartialSupportAlert } = this.props
    const expectedChainName = getChainName(appChainId)
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
                  onSwitchNetwork={this.handleSwitchNetwork}
                />
              ) : null}
              <NavbarComponent {...this.props} i18n={this.getTranslations()} />
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
                    <Button primary onClick={this.handleSwitchNetwork}>
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
}
