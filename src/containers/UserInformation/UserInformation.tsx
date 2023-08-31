import * as React from 'react'
import {
  UserInformationContainer as UserMenuComponent,
  UserInformationComponentI18N
} from 'decentraland-ui/dist/components/UserInformationContainer/UserInformationContainer'
import { T } from '../../modules/translation/utils'
import { Props } from './UserInformation.types'

export default class UserMenu extends React.Component<Props> {
  getTranslations = (): UserInformationComponentI18N | undefined => {
    if (!this.props.hasTranslations) {
      return undefined
    }
    return {
      signIn: <T id="@dapps.user_menu.sign_in" />,
      signOut: <T id="@dapps.user_menu.sign_out" />,
      guest: <T id="@dapps.user_menu.guest" />,
      settings: <T id="@dapps.user_menu.settings" />,
      wallet: <T id="@dapps.user_menu.wallet" />,
      profile: <T id="@dapps.user_menu.profile" />,
      myAssets: <T id="@dapps.user_menu.myAssets" />,
      myLists: <T id="@dapps.user_menu.myLists" />
    }
  }

  render() {
    return <UserMenuComponent {...this.props} i18n={this.getTranslations()} />
  }
}
