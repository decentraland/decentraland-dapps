import * as React from 'react'

import { Page, NavbarProps, PageProps, FooterProps } from 'decentraland-ui'

import Navbar from '../Navbar'
import Footer from '../Footer'
import { AppProps } from './App.types'

export default class App extends React.PureComponent<
  Partial<AppProps & NavbarProps & PageProps & FooterProps>
> {
  render() {
    const { children, ...rest } = this.props
    return (
      <>
        <Navbar {...rest as NavbarProps} />
        <Page {...rest as PageProps}>{children}</Page>
        <Footer {...rest as FooterProps} />
      </>
    )
  }
}
