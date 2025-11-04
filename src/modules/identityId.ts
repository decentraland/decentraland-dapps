import { AuthClient } from './authClient'
import { AuthIdentity } from '@dcl/crypto'

export async function getIdentityId(identity: AuthIdentity): Promise<string> {
  const authClient = new AuthClient({ identity })

  const response = await authClient.createIdentityId(identity)
  return response.identityId
}
