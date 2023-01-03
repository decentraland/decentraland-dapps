import { LambdasClient } from 'dcl-catalyst-client'
import { Profile } from '../modules/profile/types'
import { BaseAPI } from './api'
import { FetchProfileOptions, ProfileEntity } from './types'

export class PeerAPI extends BaseAPI {
  cache: Record<string, Promise<Profile>> = {}
  lambdasClient: LambdasClient

  constructor(url: string) {
    super(url)
    this.lambdasClient = new LambdasClient({ lambdasUrl: `${url}/lambdas` })
  }

  /**
   * Fetches a profile only once by caching the promise
   * to prevent concurrent flying requests
   *
   * @param address - The address of the profile to retrieve.
   */
  public async fetchProfile(
    address: string,
    options: FetchProfileOptions = { useCache: true }
  ): Promise<Profile> {
    if (options.useCache && address in this.cache) {
      return this.cache[address]
    }

    this.cache[address] = this.lambdasClient
      .fetchProfiles([address.toLowerCase()], undefined, {
        headers: { 'Cache-Control': 'max-age=0', Pragma: 'no-cache' }
      })
      .then(profiles => profiles[0])

    return this.cache[address]
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
