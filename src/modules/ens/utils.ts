import { Address } from 'web3x-es/address'
import { Eth } from 'web3x-es/eth'
import { fromWei } from 'web3x-es/utils'
import { getConnectedProvider } from '../../lib/eth'
import { DCLRegistrar } from '../../contracts/DCLRegistrar'
import { Provider } from '../wallet/types'
import { ENS } from './types'

export const PRICE_IN_WEI = 100000000000000000000 // 100 MANA
export const PRICE = fromWei(PRICE_IN_WEI.toString(), 'ether')
export const MAX_NAME_SIZE = 15
export const MIN_NAME_SIZE = 2

/**
 * The name may have a maximum of 15 characters (length === 15).
 * Names can contain:
 *  - Characters from 0-9, a-z, A-Z
 * Names can not contain:
 *  - Spaces
 *  - Special characters as '/', '_', ':', etc.
 *  - emojis
 */
const nameRegex = new RegExp(`^([a-zA-Z0-9]){2,${MAX_NAME_SIZE}}$`)

export async function getEth(): Promise<Eth> {
  const provider: Provider | null = await getConnectedProvider()
  if (!provider) {
    throw new Error('Could not get a valid connected Wallet')
  }

  return new Eth(provider)
}

export function getDomainFromName(name: string): string {
  return `${name.toLowerCase()}.dcl.eth`
}

export function hasNameMinLength(name: string): boolean {
  return name.length >= MIN_NAME_SIZE
}

export function isNameValid(name: string): boolean {
  return nameRegex.test(name)
}

export function findBySubdomain(ensList: ENS[], subdomain: string) {
  return ensList.find(ens => ens.subdomain === subdomain)
}

export function isEmpty(ens: ENS) {
  return isResolverEmpty(ens) && isContentEmpty(ens)
}

export function isResolverEmpty(ens: ENS) {
  return ens.resolver === Address.ZERO.toString()
}

export function isContentEmpty(ens: ENS) {
  return ens.content === Address.ZERO.toString()
}

export function isEqualContent(ens: ENS, land: { id: string }) {
  return ens.landId === land.id
}

export function isEnoughClaimMana(mana: string) {
  // 100 is the minimum amount of MANA the user needs to claim a new Name
  // We're checking against this instead of 0 when checking the allowance too because
  // we do not yet support the double transaction needed to set the user's allowance to 0 first and then bump it up to wichever number
  return Number(mana) >= 100
}

export function createEnsUtils({
  peerUrl,
  registrarContractAddress
}: {
  peerUrl: string
  registrarContractAddress: string
}) {
  async function setProfileFromEntity(entity: any) {
    entity.metadata.avatars[0].avatar.snapshots.face = `${peerUrl}/content/contents/${entity.metadata.avatars[0].avatar.snapshots.face}`
    entity.metadata.avatars[0].avatar.snapshots.body = `${peerUrl}/content/contents/${entity.metadata.avatars[0].avatar.snapshots.body}`
    return entity
  }

  async function getDefaultProfileEntity() {
    const profile = await fetch(
      peerUrl +
        '/content/entities/profile?pointer=default' +
        Math.floor(Math.random() * 128 + 1)
    ).then(resp => resp.json())
    return profile[0]
  }

  async function isNameAvailable(name: string): Promise<boolean> {
    if (!name) {
      return false
    }
    const eth = await getEth()
    const contractDCLRegistrar = new DCLRegistrar(
      eth,
      Address.fromString(registrarContractAddress)
    )
    return contractDCLRegistrar.methods.available(name).call()
  }

  return {
    isNameAvailable,
    getDefaultProfileEntity,
    setProfileFromEntity
  }
}
