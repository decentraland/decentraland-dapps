import { useState, useEffect, useCallback } from 'react'
import { AuthAPI, AuthIdentityPayload } from '../modules/auth-api'
import { AuthIdentity } from 'decentraland-crypto-fetch'

const useSignInIdentity = (identity: AuthIdentity | undefined) => {
  const [authClient, setAuthClient] = useState<AuthAPI | null>(null)

  useEffect(() => {
    if (identity) {
      const client = new AuthAPI({ identity })
      setAuthClient(client)
    } else {
      setAuthClient(null)
    }
  }, [identity])

  const createIdentityId = useCallback(
    async (identityPayload: AuthIdentityPayload) => {
      if (!authClient) {
        throw new Error('Auth client not initialized')
      }

      try {
        const response = await authClient.createIdentityId(identityPayload)
        return response
      } catch (error) {
        console.error('Error creating identity:', error)
        throw error
      }
    },
    [authClient]
  )

  return {
    createIdentityId
  }
}

export default useSignInIdentity
