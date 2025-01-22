import { BannerProps as UIBannerProps } from 'decentraland-ui2'

export type BannerProps = UIBannerProps & { id: string }
export type OwnProps = Pick<BannerProps, 'id'>
export type MapStateProps = Pick<
  BannerProps,
  'fields' | 'assets' | 'isLoading' | 'error' | 'onClick'
>
