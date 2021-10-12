import * as React from 'react'
import {
  LoginModal as BaseLoginModal,
  LoginModalI18N,
  LoginModalOptionI18N,
  LoginModalOptionType
} from 'decentraland-ui/dist/components/LoginModal/LoginModal'
import { ProviderType, connection } from 'decentraland-connect'
import { T, t } from '../../modules/translation/utils'
import { DefaultProps, Props, State } from './LoginModal.types'
import { toModalOptionType, toProviderType } from './utils'

export default class LoginModal extends React.PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    isLoading: false
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.hasError && this.props.hasError) {
      this.setState({
        hasError: true
      })
    } else if (prevProps.hasError && !this.props.hasError) {
      this.setState({
        hasError: false
      })
    }
  }

  handleOnConnect = (loginType: LoginModalOptionType) => {
    let providerType: ProviderType = toProviderType(loginType)
    this.props.onConnect(providerType)
  }

  getModalTranslations = (): LoginModalI18N | undefined => {
    if (!this.props.hasTranslations) {
      return undefined
    }
    return {
      title: <T id="@dapps.login.modal.title" />,
      subtitle: <T id="@dapps.login.modal.subtitle" />,
      error: <T id="@dapps.login.modal.error" />
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

  renderLoginModalOption = (providerType: ProviderType) => {
    const loginType = toModalOptionType(providerType)

    return loginType ? (
      <BaseLoginModal.Option
        key={loginType}
        type={loginType}
        i18n={this.getOptionTranslations()}
        onClick={() => this.handleOnConnect(loginType!)}
      />
    ) : null
  }

  render() {
    const { open, className, isLoading, onClose } = this.props
    const { hasError } = this.state

    return (
      <BaseLoginModal
        open={open}
        className={className}
        i18n={this.getModalTranslations()}
        message={
          <T
            id="@dapps.login.modal.supported_wallets"
            values={{
              br: <br />,
              trezor_link: (
                <a
                  href="https://github.com/trezor/trezor-firmware/pull/1568"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('@dapps.login.modal.trezor_link')}
                </a>
              )
            }}
          />
        }
        loading={isLoading}
        hasError={hasError}
        onClose={onClose}
      >
        {connection.getAvailableProviders().map(this.renderLoginModalOption)}
      </BaseLoginModal>
    )
  }
}
