import { LambdasClient } from 'dcl-catalyst-client'
import { Profile } from '../modules/profile/types'
import { BaseAPI } from './api'

export class PeerAPI extends BaseAPI {
  cache: Record<string, Promise<Profile>> = {}
  lambdasClient: LambdasClient

  constructor(url: string) {
    super(url)
    this.lambdasClient = new LambdasClient(`${url}/lambdas`)
  }

  fetchProfile = async (address: string) => {
    if (address in this.cache) {
      return this.cache[address]
    }
    const promise = this.lambdasClient
      .fetchProfiles([address.toLowerCase()])
      .then(profiles => profiles[0])
    this.cache[address] = promise
    return promise
  }
}
