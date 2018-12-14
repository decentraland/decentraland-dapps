import * as React from 'react'

import { Page, NavbarProps, PageProps, FooterProps } from 'decentraland-ui'

import Navbar from '../Navbar'
import Footer from '../Footer'
import { AppProps } from './App.types'

export default class App extends React.PureComponent<
  AppProps & NavbarProps & PageProps & FooterProps
> {
  render() {
    const { hero, isHomePage, children, ...rest } = this.props
    const hasHero = hero != null && isHomePage
    return (
      <>
        <Navbar {...rest as NavbarProps}>{hasHero ? hero : null}</Navbar>
        <Page hasHero={hasHero} {...rest as PageProps}>
          {children}
        </Page>
        <Footer {...rest as FooterProps} />
      </>
    )
  }
}
