import { FeaturesState } from './reducer'

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
  DAPPS = 'dapps',
  TEST = 'test'
}

export type Polling = {
  apps: ApplicationName[]
  delay: number
}

export type FeatureSagasConfig = {
  polling?: Polling
}

export type StateWithFeatures = {
  // Possibly undefined because clients might not have implemented the features module into their dapps.
  // This allows us to check that before operating on it.
  features?: FeaturesState
}
