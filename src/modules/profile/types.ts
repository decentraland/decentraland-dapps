import { Avatar } from 'decentraland-ui'
import { ProfileState } from './reducer'

export type Profile = {
  avatars: Avatar[]
}

export type EntityDeploymentError = {
  message: string
  code?: number
}
