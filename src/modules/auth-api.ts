import { getEnv, Env } from '@dcl/ui-env'
import { AuthChain } from '@dcl/schemas'

import { BaseClient, BaseClientConfig } from '../lib/BaseClient'

export interface EphemeralIdentity {
  address: string
  privateKey: string
}

export interface AuthIdentityPayload {
  authChain: AuthChain
  ephemeralIdentity: EphemeralIdentity
}

export interface CreateIdentityRequest {
  identity: AuthIdentityPayload
}

export interface IdentityResponse {
  identityId: string
  expiration: Date
}

export class AuthAPI extends BaseClient {
  constructor(config: BaseClientConfig) {
    const url =
      getEnv() === Env.DEVELOPMENT
        ? 'https://auth-api.decentraland.zone'
        : 'https://auth-api.decentraland.org'

    super(url, config)
  }

  async createIdentityId(
    identityPayload: AuthIdentityPayload
  ): Promise<IdentityResponse> {
    const response = await this.fetch<IdentityResponse>('/identities', {
      method: 'POST',
      body: JSON.stringify({ identity: identityPayload }),
      headers: { 'Content-Type': 'application/json' },
      metadata: {
        signer: 'dcl:auth',
        intent: 'dcl:auth:create-identity'
      }
    })

    return {
      ...response,
      expiration: new Date(response.expiration)
    }
  }
}
