import * as React from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { ModalNavigation } from 'decentraland-ui/dist/components/ModalNavigation/ModalNavigation'
import { Navbar as NavbarComponent, NavbarI18N } from 'decentraland-ui/dist/components/Navbar/Navbar'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { getChainName } from '@dcl/schemas/dist/dapps/chain-id'
import {
  getConnectedProviderChainId,
  getConnectedProviderType
} from '../../lib/eth'
import { T, t } from '../../modules/translation/utils'
import Modal from '../../containers/Modal'
import ChainProvider from '../ChainProvider'
import { NavbarProps } from './Navbar.types'

export default class Navbar extends React.PureComponent<NavbarProps> {
  getTranslations = (): NavbarI18N | undefined => {
    if (!this.props.hasTranslations) {
      return undefined
    }
    return {
      menu: {
        marketplace: <T id="@dapps.navbar.menu.marketplace" />,
        events: <T id="@dapps.navbar.menu.events" />,
        agora: <T id="@dapps.navbar.menu.agora" />,
        dao: <T id="@dapps.navbar.menu.dao" />,
        docs: <T id="@dapps.navbar.menu.docs" />,
        blog: <T id="@dapps.navbar.menu.blog" />,
        builder: <T id="@dapps.navbar.menu.builder" />
      },
      account: {
        connecting: <T id="@dapps.navbar.account.connecting" />,
        signIn: <T id="@dapps.navbar.account.signIn" />
      }
    }
  }

  handleSwitchNetwork = () => {
    this.props.onSwitchNetwork(getConnectedProviderChainId()!)
  }

  handleSignOut = () => {
    this.props.onSignOut()
  }

  render() {
    const {
      hasAcceptedNetworkPartialSupport,
      onAcceptNetworkPartialSupport
    } = this.props
    const expectedChainName = getChainName(getConnectedProviderChainId()!)
    const providerType = getConnectedProviderType()
    return (
      <>
        <NavbarComponent {...this.props} i18n={this.getTranslations()} />
        <ChainProvider>
          {({ chainId, isUnsupported, isPartiallySupported }) =>
            isUnsupported ? (
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
                  {providerType === ProviderType.WALLET_CONNECT ? (
                    <Button primary onClick={this.handleSignOut}>
                      {t('@dapps.navbar.wrong_network.sign_out')}
                    </Button>
                  ) : (
                    <Button primary onClick={this.handleSwitchNetwork}>
                      <T
                        id="@dapps.navbar.wrong_network.switch_button"
                        values={{
                          chainName: <b>{expectedChainName}</b>
                        }}
                      />
                    </Button>
                  )}
                </Modal.Actions>
              </Modal>
            ) : isPartiallySupported ? (
              <Modal open={!hasAcceptedNetworkPartialSupport} size="small">
                <ModalNavigation
                  title={
                    <T id="@dapps.navbar.partially_supported_network.header" />
                  }
                />
                <Modal.Content>
                  <T
                    id="@dapps.navbar.partially_supported_network.message"
                    values={{
                      currentChainName: <b>{getChainName(chainId!)}</b>,
                      expectedChainName: <b>{expectedChainName}</b>
                    }}
                  />
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
                  <Button secondary onClick={onAcceptNetworkPartialSupport}>
                    <T
                      id="@dapps.navbar.partially_supported_network.continue_button"
                      values={{
                        chainName: <b>{getChainName(chainId!)}</b>
                      }}
                    />
                  </Button>
                </Modal.Actions>
              </Modal>
            ) : null
          }
        </ChainProvider>
      </>
    )
  }
}
