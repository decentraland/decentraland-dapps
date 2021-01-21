import * as React from 'react'

import { SignIn, SignInI18N } from 'decentraland-ui'

import { T } from '../../modules/translation/utils'
import { isMobile } from '../../lib/utils'
import { isCucumberProvider } from '../../lib/eth'
import { SignInPageProps, SignInPageState } from './SignInPage.types'
import LoginModal from '../LoginModal'

export default class SignInPage extends React.PureComponent<
  SignInPageProps,
  SignInPageState
> {
  constructor(props: SignInPageProps) {
    super(props)
    this.state = {
      isLoginModalOpen: false
    }
  }

  handleToggleLoginModal = () => {
    this.setState({ isLoginModalOpen: !this.state.isLoginModalOpen })
  }

  getTranslations = (): SignInI18N | undefined => {
    const { hasTranslations, isConnected } = this.props
    if (!hasTranslations) {
      return undefined
    }

    return {
      header: <T id="@dapps.sign_in.get_started" />,
      error: <T id="@dapps.sign_in.error" />,
      connect: <T id="@dapps.sign_in.connect" />,
      connecting: <T id="@dapps.sign_in.connecting" />,
      connected: <T id="@dapps.sign_in.connected" />,
      message: isConnected ? (
        <T id="@dapps.sign_in.options.connected" />
      ) : isCucumberProvider() ? (
        <T
          id="@dapps.sign_in.options.samsung"
          values={{
            samsung_link: (
              <a
                href="https://www.samsung.com/global/galaxy/apps/samsung-blockchain/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Samsung Blockchain Wallet
              </a>
            )
          }}
        />
      ) : isMobile() ? (
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
    const { isLoginModalOpen } = this.state
    return (
      <>
        <SignIn
          {...this.props}
          onConnect={this.handleToggleLoginModal}
          i18n={this.getTranslations()}
        />
        <LoginModal
          {...(this.props as any)}
          open={isLoginModalOpen}
          onClose={this.handleToggleLoginModal}
        />
      </>
    )
  }
}
