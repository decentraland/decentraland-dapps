import * as React from 'react'

import {
  ModalNavigation,
  Navbar as NavbarComponent,
  NavbarI18N
} from 'decentraland-ui'
import { ChainId, getChainName } from '@dcl/schemas'
import { getConnectedProviderChainId } from '../../lib/eth'
import { T } from '../../modules/translation/utils'
import Modal from '../../containers/Modal'
import { NavbarProps, WrongNetworkModalI18N } from './Navbar.types'

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

  getModalTranslations = (): WrongNetworkModalI18N | undefined => {
    if (!this.props.hasTranslations) {
      return undefined
    }
    return {
      wrongNetwork: {
        header: <T id="@dapps.navbar.wrongNetwork.header" />,
        message: (
          <T
            id="@dapps.navbar.wrongNetwork.message"
            values={{ currentChainName: '', expectedChainName: '' }}
          />
        )
      }
    }
  }

  isValidChainId(
    currentChainId: ChainId,
    expectedChainId: ChainId | null
  ): expectedChainId is ChainId {
    return !!expectedChainId && currentChainId !== expectedChainId
  }

  render() {
    const { chainId } = this.props
    const expectedChainId = getConnectedProviderChainId()
    return (
      <>
        <NavbarComponent {...this.props} i18n={this.getTranslations()} />
        {chainId && this.isValidChainId(chainId, expectedChainId) ? (
          <Modal open={true} size="tiny" i18n={this.getModalTranslations()}>
            <ModalNavigation
              title={<T id="@dapps.navbar.wrongNetwork.header" />}
            />
            <Modal.Content>
              <T
                id="@dapps.navbar.wrongNetwork.message"
                values={{
                  currentChainName: <b>{getChainName(chainId)}</b>,
                  expectedChainName: <b>{getChainName(expectedChainId)}</b>
                }}
              />
            </Modal.Content>
          </Modal>
        ) : null}
      </>
    )
  }
}
