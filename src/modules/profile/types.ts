import type { Avatar } from '@dcl/schemas/dist/platform/profile'

export type Profile = {
  avatars: Avatar[]
}

export type EntityDeploymentError = {
  message: string
  code?: number
}
