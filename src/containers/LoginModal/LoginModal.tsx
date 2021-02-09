import * as React from 'react'
import {
  LoginModal as BaseLoginModal,
  LoginModalI18N,
  LoginModalOptionI18N,
  LoginModalOptionType
} from 'decentraland-ui'
import { ProviderType, connection } from 'decentraland-connect'
import { T } from '../../modules/translation/utils'
import { isDapperProvider } from '../../lib/eth'
import { DefaultProps, Props, State } from './LoginModal.types'

const { METAMASK, DAPPER, FORTMATIC, WALLET_CONNECT } = LoginModalOptionType

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
    let providerType: ProviderType
    switch (loginType) {
      case METAMASK:
      case DAPPER:
        providerType = ProviderType.INJECTED
        break
      case FORTMATIC:
        providerType = ProviderType.FORTMATIC
        break
      case WALLET_CONNECT:
        providerType = ProviderType.WALLET_CONNECT
        break
      default:
        throw new Error(`Invalid login type ${loginType}`)
    }

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
    let loginType: LoginModalOptionType | undefined

    switch (providerType) {
      case ProviderType.INJECTED:
        loginType = isDapperProvider() ? DAPPER : METAMASK
        break
      case ProviderType.FORTMATIC:
        loginType = FORTMATIC
        break
      case ProviderType.WALLET_CONNECT:
        break
      default:
        console.warn(`Invalid provider type ${providerType}`)
        break
    }

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
    const { isLoading } = this.props
    const { hasError } = this.state

    return (
      <BaseLoginModal
        {...this.props}
        i18n={this.getModalTranslations()}
        loading={isLoading}
        hasError={hasError}
      >
        {connection.getAvailableProviders().map(this.renderLoginModalOption)}
      </BaseLoginModal>
    )
  }
}
