import { Wallet } from 'ethers'
import { Bytes } from '@ethersproject/bytes'
import { Signer } from '@ethersproject/abstract-signer'
import { Authenticator } from '@dcl/crypto'
import { AuthIdentity } from 'decentraland-crypto-fetch'

const addressExpression = '0x[a-fA-F0-9]{40}'
const expirationDateExpression =
  '\\d{4}-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d(\\.\\d+)?(([+-]\\d\\d:\\d\\d)|Z)?'
export const addressRegex = new RegExp(`^${addressExpression}$`)
export const publicKeyRegex = /^0x[a-fA-F0-9]{130}$/
export const secondHeaderPayloadRegex = new RegExp(
  `^Decentraland Login\\sEphemeral address: ${addressExpression}\\sExpiration: ${expirationDateExpression}$`
)

export async function createIdentity(
  signer: Signer,
  expiration: number
): Promise<AuthIdentity> {
  const address = await signer.getAddress()

  const wallet = Wallet.createRandom()
  const payload = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey
  }

  const identity = await Authenticator.initializeAuthChain(
    address,
    payload,
    expiration,
    (message: string | Bytes) => signer.signMessage(message)
  )

  return identity as AuthIdentity
}

export const firstHeaderValueMatcher = (value: string): boolean => {
  const parsedValue = JSON.parse(value)
  return (
    parsedValue.type === 'SIGNER' &&
    addressRegex.test(parsedValue.payload) &&
    parsedValue.signature === ''
  )
}

export const secondHeaderValueMatcher = (value: string): boolean => {
  const parsedValue = JSON.parse(value)
  return (
    parsedValue.type === 'ECDSA_EPHEMERAL' &&
    secondHeaderPayloadRegex.test(parsedValue.payload) &&
    publicKeyRegex.test(parsedValue.signature)
  )
}

export const thirdHeaderValueMatcher = (method: string, url: string) => (
  value: string
): boolean => {
  const parsedValue = JSON.parse(value)
  return (
    parsedValue.type === 'ECDSA_SIGNED_ENTITY' &&
    parsedValue.payload.includes(
      `${method.toLowerCase()}:${url.toLocaleLowerCase()}`
    ) &&
    publicKeyRegex.test(parsedValue.signature)
  )
}
