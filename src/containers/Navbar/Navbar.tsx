import * as React from 'react'

import {
  Button,
  ModalNavigation,
  Navbar as NavbarComponent,
  NavbarI18N
} from 'decentraland-ui'
import { getChainName } from '@dcl/schemas'
import { getConnectedProviderChainId } from '../../lib/eth'
import { T } from '../../modules/translation/utils'
import Modal from '../../containers/Modal'
import { NavbarProps, NavbarState } from './Navbar.types'
import ChainProvider from '../ChainProvider'

export default class Navbar extends React.PureComponent<
  NavbarProps,
  NavbarState
> {
  state: NavbarState = {
    isPartialSupportModalOpen: true
  }

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

  handleClosePartialSupportModal = () => {
    this.setState({ isPartialSupportModalOpen: false })
  }

  handleSwitchNetwork = () => {
    this.props.onSwitchNetwork(getConnectedProviderChainId()!)
  }

  render() {
    const expectedChainName = getChainName(getConnectedProviderChainId()!)
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
            ) : isPartiallySupported ? (
              <Modal open={this.state.isPartialSupportModalOpen} size="tiny">
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
                  <Button
                    secondary
                    onClick={this.handleClosePartialSupportModal}
                  >
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
