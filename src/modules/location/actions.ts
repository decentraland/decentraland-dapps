import { action } from 'typesafe-actions'

export const NAVIGATE_TO = 'Navigate to URL'

export const navigateTo = (url: string) => action(NAVIGATE_TO, { url })

export type NavigateToAction = ReturnType<typeof navigateTo>
