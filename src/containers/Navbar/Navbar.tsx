import * as React from 'react'

import { Navbar as NavbarComponent, NavbarI18N } from 'decentraland-ui'
import { getChainName } from '@dcl/schemas'
import { getConnectedProviderChainId } from '../../lib/eth'
import { T } from '../../modules/translation/utils'
import Modal from '../../containers/Modal'
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

  render() {
    const { chainId } = this.props
    const expectedChainId = getConnectedProviderChainId()
    const expectedChainName = expectedChainId
      ? getChainName(expectedChainId)
      : ''
    const currentChainName = chainId ? getChainName(chainId) : ''
    return (
      <>
        <NavbarComponent {...this.props} i18n={this.getTranslations()} />
        {chainId && chainId !== expectedChainId ? (
          <Modal open={true} size="tiny">
            <Modal.Header>
              <T id="@dapps.navbar.wrong-network.header" />
            </Modal.Header>
            <Modal.Content>
              <T
                id="@dapps.navbar.wrong-network.message"
                values={{
                  currentChainName: <b>{currentChainName} </b>,
                  expectedChainName: <b>{expectedChainName} </b>
                }}
              />
            </Modal.Content>
          </Modal>
        ) : null}
      </>
    )
  }
}
