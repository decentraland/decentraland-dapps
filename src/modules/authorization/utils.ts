import { ethers } from 'ethers'
import { Authorization, AuthorizationType } from './types'

export function getTokenAmountToApprove(): ethers.BigNumber {
  return ethers.BigNumber.from(2)
    .pow(256)
    .sub(1)
}

export function hasAuthorization(
  authorizations: Authorization[],
  authorizationToFind: Authorization
) {
  return authorizations.some(authorization =>
    areEqual(authorization, authorizationToFind)
  )
}

export function hasAuthorizationAndEnoughAllowance(
  authorizations: Authorization[],
  authorizationToFind: Authorization,
  allowance: string
) {
  const foundAuth = authorizations.find(authorization =>
    areEqual(authorization, authorizationToFind)
  )

  if (!foundAuth) {
    return false
  }

  // It should only care in the case of allowance authorizations.
  // The rest don't have allowance so they can be ignored.
  if (authorizationToFind.type !== AuthorizationType.ALLOWANCE) {
    return true
  }

  const { allowance: foundAuthAllowance } = foundAuth

  if (!foundAuthAllowance) {
    return false
  }

  const a = ethers.utils.parseEther(allowance)
  const b = ethers.utils.parseEther(foundAuthAllowance)

  return a.lte(b)
}

export function areEqual(left: Authorization, right: Authorization) {
  return (
    left.type === right.type &&
    left.authorizedAddress.toLowerCase() ===
      right.authorizedAddress.toLowerCase() &&
    left.contractAddress.toLowerCase() ===
      right.contractAddress.toLowerCase() &&
    left.chainId === right.chainId &&
    left.address.toLowerCase() === right.address.toLowerCase()
  )
}

export function isValidType(type: string) {
  return Object.values<string>(AuthorizationType).includes(type)
}
