import { AuthIdentity } from '@dcl/crypto'
import { Env, getEnv } from '@dcl/ui-env'
import { BaseClient, BaseClientConfig } from '../lib/BaseClient'

export interface EphemeralIdentity {
  address: string
  privateKey: string
}

export interface CreateIdentityRequest {
  identity: AuthIdentity
}

export interface IdentityResponse {
  identityId: string
  expiration: Date
}

export class AuthClient extends BaseClient {
  constructor(config: BaseClientConfig) {
    const url = getEnv() === Env.DEVELOPMENT ? 'https://auth-api.decentraland.zone' : 'https://auth-api.decentraland.org'

    super(url, config)
  }

  async createIdentityId(identityPayload: AuthIdentity): Promise<IdentityResponse> {
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
