import { ToastPosition } from 'decentraland-ui'
import { ToastProps } from 'decentraland-ui/dist/components/Toast/Toast'

export type Toast = { id: number; position?: ToastPosition } & ToastProps
