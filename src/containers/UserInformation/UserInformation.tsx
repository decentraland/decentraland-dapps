import React, { useCallback, useMemo } from 'react'
import { UserInformationContainer as UserMenuComponent } from 'decentraland-ui/dist/components/UserInformationContainer/UserInformationContainer'
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
    onClickSettings,
    onClickActivity,
    onClickMyLists,
    onClickMyAssets,
    onClickProfile,
    onClickAccount,
    ...rest
  } = props

  const trackMethod = useCallback(
    (method: Function, type: string) => () => {
      if (analytics) {
        analytics.track('User Menu', { type })
      }
      // Waits for the tracking process to end in case the method redirects the user to another site
      setTimeout(() => {
        method()
      }, 300)
    },
    [analytics]
  )

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

  const handleOnOpen = useCallback(() => {
    if (analytics) {
      analytics.track('User Menu', { type: 'Open' })
    }
    if (onOpen) {
      setTimeout(() => {
        onOpen()
      }, 300)
    }
  }, [analytics, onOpen])

  const handleOnClickBalance = useCallback(
    network => {
      if (analytics) {
        analytics.track('User Menu', { type: 'Balance', network })
      }
      if (onClickBalance) {
        setTimeout(() => {
          onClickBalance(network)
        }, 300)
      }
    },
    [onClickBalance]
  )

  const methodProps: Pick<
    Props,
    | 'onSignIn'
    | 'onSignOut'
    | 'onClickBalance'
    | 'onClickSettings'
    | 'onClickActivity'
    | 'onClickMyLists'
    | 'onClickMyAssets'
    | 'onClickProfile'
    | 'onClickAccount'
    | 'onOpen'
  > = useMemo(() => {
    const methods: typeof methodProps = {
      onSignOut: trackMethod(onSignOut, 'Sign out'),
      onSignIn: trackMethod(onSignIn, 'Sign in')
    }

    methods.onOpen = handleOnOpen
    methods.onClickBalance = handleOnClickBalance

    if (onClickSettings) {
      methods.onClickSettings = trackMethod(onClickSettings, 'Settings')
    }

    if (onClickActivity) {
      methods.onClickActivity = trackMethod(onClickActivity, 'Activity')
    }

    if (onClickMyLists) {
      methods.onClickMyLists = trackMethod(onClickMyLists, 'My lists')
    }

    if (onClickMyAssets) {
      methods.onClickMyAssets = trackMethod(onClickMyAssets, 'My assets')
    }

    if (onClickProfile) {
      methods.onClickProfile = trackMethod(onClickProfile, 'Profile')
    }

    if (onClickAccount) {
      methods.onClickAccount = trackMethod(onClickAccount, 'Account')
    }

    return methods
  }, [
    onSignOut,
    onSignIn,
    onClickBalance,
    onClickSettings,
    onClickActivity,
    onClickMyLists,
    onClickMyAssets,
    onClickProfile,
    onOpen,
    onClickAccount
  ])

  return <UserMenuComponent {...methodProps} {...rest} i18n={translations} />
}
