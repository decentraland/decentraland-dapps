import { action } from 'typesafe-actions'

export const NAVIGATE_TO = 'Navigate to URL'

export const navigateTo = (url: string) => action(NAVIGATE_TO, { url })

export type NavigateToAction = ReturnType<typeof navigateTo>

export const NAVIGATE_TO_SIGN_IN = 'Navigate to sign in'

export const navigateToSignIn = () => action(NAVIGATE_TO_SIGN_IN)

export type NavigateToSignInAction = ReturnType<typeof navigateToSignIn>

export const NAVIGATE_TO_ROOT = 'Navigate to root'

export const navigateToRoot = () => action(NAVIGATE_TO_ROOT)

export type NavigateToRootAction = ReturnType<typeof navigateToRoot>
