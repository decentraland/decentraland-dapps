import { BannerFields } from '@dcl/schemas'
import { BannerProps as UIBannerProps } from 'decentraland-ui2'

export type BannerProps = Omit<UIBannerProps, 'fields'> & {
  fields: (BannerFields & { id: string }) | null
} & { id: string }
export type OwnProps = Pick<BannerProps, 'id'>
export type MapStateProps = Pick<BannerProps, 'fields' | 'assets' | 'isLoading' | 'error' | 'locale'>
