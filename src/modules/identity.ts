import { AuthAPI, AuthIdentityPayload } from './auth-api'
import { AuthIdentity } from 'decentraland-crypto-fetch'

export async function getIdentityId(identity: AuthIdentity): Promise<string> {
  if (!identity) {
    throw new Error('Identity is required')
  }

  if (!identity.authChain || !identity.ephemeralIdentity) {
    throw new Error('Identity must contain authChain and ephemeralIdentity')
  }

  const authClient = new AuthAPI({ identity })
  const identityPayload: AuthIdentityPayload = {
    authChain: identity.authChain,
    ephemeralIdentity: identity.ephemeralIdentity
  }

  const response = await authClient.createIdentityId(identityPayload)
  return response.identityId
}
