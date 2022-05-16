export type Payload = {
  type: string
  value: string
}

export type Variant = {
  name: string
  payload: Payload
  enabled: boolean
}

export type Feature = {
  application: Applications
  flags: Record<string, boolean>
  variants: Record<string, Variant>
}

export enum Applications {
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
  applications: Applications[]
  fetchDelay: number
}
