import * as React from 'react'

import {
  ModalNavigation,
  Navbar as NavbarComponent,
  NavbarI18N
} from 'decentraland-ui'
import { getChainName } from '@dcl/schemas'
import { getConnectedProviderChainId } from '../../lib/eth'
import { getChainConfiguration } from '../../lib/chainConfiguration'
import { T } from '../../modules/translation/utils'
import Modal from '../../containers/Modal'
import { NavbarProps, NavbarState } from './Navbar.types'

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

  render() {
    const { chainId } = this.props
    const expectedChainId = getConnectedProviderChainId()

    const isSupportedNetwork = chainId === expectedChainId
    const config = expectedChainId && getChainConfiguration(expectedChainId)

    const isPartiallySupportedNetwork =
      !!chainId &&
      !isSupportedNetwork &&
      !!config &&
      Object.values(config.networkMapping).some(
        mappedChainId => mappedChainId === chainId
      )

    const isWrongNetwork =
      !!chainId && !isSupportedNetwork && !isPartiallySupportedNetwork

    return (
      <>
        <NavbarComponent {...this.props} i18n={this.getTranslations()} />
        {isWrongNetwork ? (
          <Modal open size="tiny">
            <ModalNavigation
              title={<T id="@dapps.navbar.wrong_network.header" />}
            />
            <Modal.Content>
              <T
                id="@dapps.navbar.wrong_network.message"
                values={{
                  currentChainName: <b>{getChainName(chainId!)}</b>,
                  expectedChainName: <b>{getChainName(expectedChainId!)}</b>
                }}
              />
            </Modal.Content>
          </Modal>
        ) : isPartiallySupportedNetwork ? (
          <Modal
            open={this.state.isPartialSupportModalOpen}
            onClose={this.handleClosePartialSupportModal}
            size="tiny"
          >
            <ModalNavigation
              title={
                <T id="@dapps.navbar.partially_supported_network.header" />
              }
              onClose={this.handleClosePartialSupportModal}
            />
            <Modal.Content>
              <T
                id="@dapps.navbar.partially_supported_network.message"
                values={{
                  currentChainName: <b>{getChainName(chainId!)}</b>,
                  expectedChainName: <b>{getChainName(expectedChainId!)}</b>
                }}
              />
            </Modal.Content>
          </Modal>
        ) : null}
      </>
    )
  }
}
