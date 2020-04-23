import * as React from 'react'

import { Navbar as NavbarComponent, NavbarI18N } from 'decentraland-ui'

import { NavbarProps } from './Navbar.types'
import { T } from '../../modules/translation/utils'

export default class Navbar extends React.PureComponent<NavbarProps> {
  getTranslations = (): NavbarI18N | undefined => {
    if (!this.props.hasTranslations) {
      return undefined
    }
    return {
      menu: {
        avatars: <T id="@dapps.navbar.menu.avatars" />,
        marketplace: <T id="@dapps.navbar.menu.marketplace" />,
        events: <T id="@dapps.navbar.menu.dao" />,
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
    return <NavbarComponent {...this.props} i18n={this.getTranslations()} />
  }
}
