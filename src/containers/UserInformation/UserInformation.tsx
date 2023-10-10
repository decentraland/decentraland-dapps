import React, { useCallback, useMemo } from 'react'
import {
  MenuItemType,
  UserInformationContainer as UserMenuComponent
} from 'decentraland-ui/dist/components/UserInformationContainer/UserInformationContainer'
import { getAnalytics } from '../../modules/analytics/utils'
import { t } from '../../modules/translation/utils'
import { Props } from './UserInformation.types'

export const UserInformation = (props: Props) => {
  const analytics = getAnalytics()

  const {
    hasTranslations,
    onSignOut,
    onSignIn,
    onOpen,
    onClickBalance,
    ...rest
  } = props

  const translations = useMemo(() => {
    if (!props.hasTranslations) {
      return undefined
    }
    return {
      signIn: t('@dapps.user_menu.sign_in'),
      signOut: t('@dapps.user_menu.sign_out'),
      guest: t('@dapps.user_menu.guest'),
      settings: t('@dapps.user_menu.settings'),
      wallet: t('@dapps.user_menu.wallet'),
      profile: t('@dapps.user_menu.profile'),
      myAssets: t('@dapps.user_menu.myAssets'),
      myLists: t('@dapps.user_menu.myLists')
    }
  }, [hasTranslations])

  const trackMenuItemClick = useCallback(
    (type: MenuItemType, track_uuid: string) => () => {
      if (analytics) {
        analytics.track('Unified Dropdown Menu Item Click', {
          type,
          track_uuid
        })
      }
    },
    [analytics]
  )

  const handleOpen = useCallback(
    (track_uuid: string) => {
      if (analytics) {
        analytics.track('Unified Dropdown Menu Display', { track_uuid })
      }
      if (onOpen) {
        onOpen(track_uuid)
      }
    },
    [analytics, onOpen]
  )

  const handleClickBalance = useCallback(
    network => {
      if (analytics) {
        analytics.track('Unified Dropdown Menu Balance Click', { network })
      }
      if (onClickBalance) {
        setTimeout(() => {
          onClickBalance(network)
        }, 300)
      }
    },
    [onClickBalance]
  )

  const handleSignOut = useCallback(
    (track_uuid: string) => {
      if (analytics) {
        analytics.track('Unified Dropdown Menu Sign Out', { track_uuid })
      }
      if (onSignOut) {
        setTimeout(() => {
          onSignOut(track_uuid)
        }, 300)
      }
    },
    [onSignOut]
  )

  const handleSignIn = useCallback(() => {
    if (analytics) {
      analytics.track('Unified Dropdown Menu Sign In')
    }
    if (onSignIn) {
      setTimeout(() => {
        onSignIn()
      }, 300)
    }
  }, [onSignIn])

  return (
    <UserMenuComponent
      onSignOut={handleSignOut}
      onSignIn={handleSignIn}
      onClickBalance={handleClickBalance}
      onOpen={handleOpen}
      onMenuItemClick={trackMenuItemClick}
      {...rest}
      i18n={translations}
    />
  )
}
