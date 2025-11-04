import { AuthClient, AuthIdentityPayload } from './authClient'
import { AuthIdentity } from '@dcl/crypto'

export async function getIdentityId(identity: AuthIdentity): Promise<string> {
  const authClient = new AuthClient({ identity })
  const identityPayload: AuthIdentityPayload = {
    authChain: identity.authChain,
    ephemeralIdentity: identity.ephemeralIdentity
  }

  const response = await authClient.createIdentityId(identityPayload)
  return response.identityId
}
