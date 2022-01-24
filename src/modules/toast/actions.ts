import { action } from 'typesafe-actions'
import { Toast } from './types'

// Show Toast

export const SHOW_TOAST = 'Show toast'

export const showToast = (toast: Omit<Toast, 'id'>) =>
  action(SHOW_TOAST, { toast })

export type ShowToastAction = ReturnType<typeof showToast>

// Render Toast

export const RENDER_TOAST = 'Render toast'

export const renderToast = (id: number) => action(RENDER_TOAST, { id })

export type RenderToastAction = ReturnType<typeof renderToast>

// Hide Toast

export const HIDE_TOAST = 'Hide toast'

export const hideToast = (id: number) => action(HIDE_TOAST, { id })

export type HideToastAction = ReturnType<typeof hideToast>

// Hide All Toasts

export const HIDE_ALL_TOASTS = 'Hide all toasts'

export const hideAllToasts = () => action(HIDE_ALL_TOASTS)

export type HideAllToastsAction = ReturnType<typeof hideAllToasts>
