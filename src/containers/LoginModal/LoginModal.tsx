import * as React from 'react'
import {
  LoginModal as BaseLoginModal,
  LoginModalI18N,
  LoginModalOptionI18N,
  LoginModalOptionType
} from 'decentraland-ui'
import { T } from 'src/modules/translation/utils'
import { Props } from './LoginModal.types'

const { METAMASK, DAPPER, FORTMATIC, WALLET_CONNECT } = LoginModalOptionType

export default class LoginModal extends React.PureComponent<Props> {
  getModalTranslations = (): LoginModalI18N | undefined => {
    if (!this.props.hasTranslations) {
      return undefined
    }
    return {
      title: <T id="@dapps.login.modal.title" />,
      subtitle: <T id="@dapps.login.modal.subtitle" />
    }
  }

  getOptionTranslations = (): LoginModalOptionI18N | undefined => {
    if (!this.props.hasTranslations) {
      return undefined
    }
    return {
      browser_extension: <T id="@dapps.login.option.browser_extension" />,
      email: <T id="@dapps.login.option.email" />,
      mobile: <T id="@dapps.login.option.mobile" />
    }
  }

  render() {
    const { onConnect } = this.props

    return (
      <BaseLoginModal {...this.props} i18n={this.getModalTranslations()}>
        <BaseLoginModal.Option
          type={METAMASK}
          i18n={this.getOptionTranslations()}
          onClick={() => onConnect(METAMASK)}
        />
        <BaseLoginModal.Option
          type={DAPPER}
          i18n={this.getOptionTranslations()}
          onClick={() => onConnect(DAPPER)}
        />
        <BaseLoginModal.Option
          type={FORTMATIC}
          i18n={this.getOptionTranslations()}
          onClick={() => onConnect(FORTMATIC)}
        />
        <BaseLoginModal.Option
          type={WALLET_CONNECT}
          i18n={this.getOptionTranslations()}
          onClick={() => onConnect(WALLET_CONNECT)}
        />
      </BaseLoginModal>
    )
  }
}
