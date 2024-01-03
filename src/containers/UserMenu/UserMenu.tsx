import * as React from 'react'
import { UserMenu as UserMenuComponent } from 'decentraland-ui/dist/components/UserMenu/UserMenu'
import { UserMenuI18N } from 'decentraland-ui/dist/components/UserMenu/UserMenu.types'
import { t } from '../../modules/translation/utils'
import { Props } from './UserMenu.types'

export default class UserMenu extends React.Component<Props> {
  getTranslations = (): UserMenuI18N => {
    return {
      myAssets: t('@dapps.user_menu.my_assets'),
      settings: t('@dapps.user_menu.settings'),
      account: t('@dapps.user_menu.account'),
      viewProfile: t('@dapps.user_menu.view_profile'),
      signIn: t('@dapps.user_menu.sign_in'),
      signOut: t('@dapps.user_menu.sign_out'),
      guest: t('@dapps.user_menu.guest'),
      wallet: t('@dapps.user_menu.wallet'),
      jumpIn: t('@dapps.user_menu.jump_in')
    }
  }

  render() {
    return <UserMenuComponent {...this.props} i18n={this.getTranslations()} />
  }
}
