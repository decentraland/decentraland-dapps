import * as React from 'react'

import { SignIn, SignInI18N } from 'decentraland-ui'

import { SignInPageProps, SignInPageState } from './SignInPage.types'
import { T } from '../../modules/translation/utils'
import { isMobile, isCucumberProvider } from '../../lib/utils'

export default class SignInPage extends React.PureComponent<
  SignInPageProps,
  SignInPageState
  > {
  constructor(props: SignInPageProps) {
    super(props)
    this.state = {
      hasError: false
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: SignInPageProps) {
    if (nextProps.hasError && !this.state.hasError) {
      this.setState({
        hasError: true
      })
    } else if (!nextProps.hasError && this.state.hasError) {
      this.setState({
        hasError: false
      })
    }
  }

  getTranslations = (): SignInI18N | undefined => {
    if (!this.props.hasTranslations) {
      return undefined
    }

    return {
      header: <T id="@dapps.sign_in.get_started" />,
      error: <T id="@dapps.sign_in.error" />,
      connect: <T id="@dapps.sign_in.connect" />,
      connecting: <T id="@dapps.sign_in.connecting" />,
      connected: <T id="@dapps.sign_in.connected" />,
      message: isCucumberProvider() ?
        <T
          id="@dapps.sign_in.options.samsung" />
        : isMobile() ? (
          <T
            id="@dapps.sign_in.options.mobile"
            values={{
              coinbase_link: (
                <a
                  href="https://wallet.coinbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Coinbase Wallet
                </a>
              ),
              imtoken_link: (
                <a
                  href="https://token.im"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  imToken
                </a>
              )
            }}
          />
        ) : (
            <T
              id="@dapps.sign_in.options.desktop"
              values={{
                metamask_link: (
                  <a
                    href="https://metamask.io"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    MetaMask
                  </a>
                ),
                ledger_nano_link: (
                  <a
                    href="https://www.ledger.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ledger Nano S
                  </a>
                )
              }}
            />
          )
    }
  }

  render() {
    return (
      <SignIn
        {...this.props}
        hasError={this.state.hasError}
        i18n={this.getTranslations()}
      />
    )
  }
}
