export type AppProps = {
  hero: React.ReactNode
  isHomePage: boolean
}

export type MapStateProps = Pick<AppProps, 'isHomePage'>
