import { Avatar } from '@wiicamp/decentraland-ui'

export type Profile = {
  avatars: Avatar[]
}

export type EntityDeploymentError = {
  message: string
  code?: number
}
