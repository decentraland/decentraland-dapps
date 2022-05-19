import { FeatureState } from './reducer'

export type Payload = {
  type: string
  value: string
}

export type Variant = {
  name: string
  payload: Payload
  enabled: boolean
}

export type ApplicationFeatures = {
  name: ApplicationName
  flags: Record<string, boolean>
  variants: Record<string, Variant>
}

export enum ApplicationName {
  EXPLORER = 'explorer',
  BUILDER = 'builder',
  MARKETPLACE = 'marketplace',
  ACCOUNT = 'account',
  DAO = 'dao',
  EVENTS = 'events',
  LANDING = 'landing',
  TEST = 'test'
}

export type FeatureSagasConfig = {
  apps: ApplicationName[]
  fetchDelay: number
}

export type StateWithFeature = {
  feature: FeatureState
}
