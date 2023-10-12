import React, { useCallback, useMemo } from 'react'
import {
  MenuItemType,
  UserInformationContainer as UserMenuComponent
} from 'decentraland-ui/dist/components/UserInformationContainer/UserInformationContainer'
import { getAnalytics } from '../../modules/analytics/utils'
import { t } from '../../modules/translation/utils'
import { Props } from './UserInformation.types'
import {
  DROPDOWN_MENU_BALANCE_CLICK_EVENT,
  DROPDOWN_MENU_DISPLAY_EVENT,
  DROPDOWN_MENU_ITEM_CLICK_EVENT,
  DROPDOWN_MENU_SIGN_IN_EVENT,
  DROPDOWN_MENU_SIGN_OUT_EVENT
} from './constants'

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
    (type: MenuItemType, track_uuid: string) => {
      if (analytics) {
        analytics.track(DROPDOWN_MENU_ITEM_CLICK_EVENT, {
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
        analytics.track(DROPDOWN_MENU_DISPLAY_EVENT, { track_uuid })
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
        analytics.track(DROPDOWN_MENU_BALANCE_CLICK_EVENT, { network })
      }
      if (onClickBalance) {
        setTimeout(() => {
          onClickBalance(network)
        }, 300)
      }
    },
    [analytics, onClickBalance]
  )

  const handleSignOut = useCallback(
    (track_uuid: string) => {
      if (analytics) {
        analytics.track(DROPDOWN_MENU_SIGN_OUT_EVENT, { track_uuid })
      }
      if (onSignOut) {
        setTimeout(() => {
          onSignOut(track_uuid)
        }, 300)
      }
    },
    [analytics, onSignOut]
  )

  const handleSignIn = useCallback(() => {
    if (analytics) {
      analytics.track(DROPDOWN_MENU_SIGN_IN_EVENT)
    }
    if (onSignIn) {
      setTimeout(() => {
        onSignIn()
      }, 300)
    }
  }, [analytics, onSignIn])

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
