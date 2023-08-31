import * as React from 'react'
import {
  UserInformationContainer as UserMenuComponent,
  UserInformationComponentI18N
} from 'decentraland-ui/dist/components/UserInformationContainer/UserInformationContainer'
import { t } from '../../modules/translation/utils'
import { Props } from './UserInformation.types'

export default class UserMenu extends React.Component<Props> {
  getTranslations = (): UserInformationComponentI18N | undefined => {
    if (!this.props.hasTranslations) {
      return undefined
    }
    return {
      signIn: t('@dapps.user_menu.sign_in'),
      signOut: t('@dapps.user_menu.sign_out'),
      guest: t('@dapps.user_menu.guest'),
      settings: t('@dapps.user_menu.settings'),
      wallet: t('@dapps.user_menu.wallet'),
      profile: t('@dapps.user_menu.profile'),
      myAssets: t('@dapps.user_menu.myAssets'),
      myLists: t('@dapps.user_menu.myLists')
    }
  }

  render() {
    return <UserMenuComponent {...this.props} i18n={this.getTranslations()} />
  }
}
