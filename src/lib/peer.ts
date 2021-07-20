import { LambdasClient } from 'dcl-catalyst-client'
import { Profile } from '../modules/profile/types'
import { BaseAPI } from './api'
import { ProfileEntity } from './types'

export class PeerAPI extends BaseAPI {
  cache: Record<string, Profile> = {}
  lambdasClient: LambdasClient

  constructor(url: string) {
    super(url)
    this.lambdasClient = new LambdasClient(`${url}/lambdas`)
  }

  // TODO, how many ways of retrieving a profile are out there?
  public async fetchProfile(address: string): Promise<Profile> {
    if (address in this.cache) {
      return this.cache[address]
    }
    const profiles = await this.lambdasClient.fetchProfiles([
      address.toLowerCase()
    ])
    this.cache[address] = profiles[0]
    return profiles[0]
  }

  /**
   * Gets the default entity structure for a profile.
   */
  public async getDefaultProfileEntity(): Promise<ProfileEntity> {
    const profile = await this.request(
      'GET',
      '/content/entities/profile?pointer=default' +
        Math.floor(Math.random() * 128 + 1)
    )
    return profile[0]
  }
}
