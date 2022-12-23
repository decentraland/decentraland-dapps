import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

export type MoonPayConfig = {
  apiBaseUrl: string
  apiKey: string
  pollingDelay?: number
  widgetBaseUrl: string
}

export type TransakConfig = {
  key: string
  env: string
}

export type ManaFiatGatewaySagasConfig = {
  environment: Environment
  [NetworkGatewayType.MOON_PAY]: MoonPayConfig
  [NetworkGatewayType.TRANSAK]: TransakConfig
}
