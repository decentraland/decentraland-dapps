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
