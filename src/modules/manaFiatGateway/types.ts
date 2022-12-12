import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'

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
  [NetworkGatewayType.MOON_PAY]: MoonPayConfig
  [NetworkGatewayType.TRANSAK]: TransakConfig
}
