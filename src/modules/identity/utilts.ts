import { AuthIdentity } from 'decentraland-crypto-fetch'
import { localStorageGetIdentity } from '@dcl/single-sign-on-client'

export function* getIdentityOrRedirect(
  lowerCasedAddress: string,
  authDappURL: string
) {
  const identity: AuthIdentity | null = localStorageGetIdentity(
    lowerCasedAddress
  )
  if (!identity) {
    window.location.replace(
      `${authDappURL}/login?redirectTo=${window.location.href}`
    )
    return
  }
  return identity
}
