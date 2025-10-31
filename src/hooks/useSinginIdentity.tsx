import { useState, useEffect, useCallback } from 'react'
import {
  AuthAPI,
  AuthIdentityPayload
} from '../modules/auth-api'
import { AuthIdentity } from 'decentraland-crypto-fetch'

const useSignInIdentity = (identity: AuthIdentity | undefined) => {
  const [{ isLoading, identityId, error }, setIdentityState] = useState<{
    isLoading: boolean
    identityId: string | null
    error: string | null
  }>({
    isLoading: false,
    identityId: null,
    error: null
  })

  const [authClient, setAuthClient] = useState<AuthAPI | null>(null)

  useEffect(() => {
    if (identity) {
      const client = new AuthAPI({ identity })
      setAuthClient(client)
    } else {
      setAuthClient(null)
      setIdentityState({
        isLoading: false,
        identityId: null,
        error: null
      })
    }
  }, [identity])

  const createIdentityId = useCallback(
    async (identityPayload: AuthIdentityPayload) => {
      if (!authClient) {
        setIdentityState(prevState => ({
          ...prevState,
          error: 'Auth client not initialized'
        }))
        return
      }

      setIdentityState(prevState => ({
        ...prevState,
        isLoading: true,
        error: null
      }))

      try {
        const response = await authClient.createIdentityId(identityPayload)
        setIdentityState({
          isLoading: false,
          identityId: response.identityId,
          error: null
        })
        return response
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unknown error creating identity'
        setIdentityState({
          isLoading: false,
          identityId: null,
          error: errorMessage
        })
        console.error('Error creating identity:', error)
        throw error
      }
    },
    [authClient]
  )

  return {
    authClient,
    identityId,
    isLoading,
    error,
    createIdentityId
  }
}

export default useSignInIdentity
