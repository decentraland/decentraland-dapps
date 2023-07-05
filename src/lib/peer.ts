import { LambdasClient, createLambdasClient } from 'dcl-catalyst-client/dist/client/LambdasClient'
import { Profile } from '../modules/profile/types'
import { BaseAPI } from './api'
import { FetchProfileOptions, ProfileEntity } from './types'
import { createFetchComponent } from '@well-known-components/fetch-component'

export class PeerAPI extends BaseAPI {
  cache: Record<string, Promise<Profile>> = {}
  lambdasClient: LambdasClient

  constructor(url: string) {
    super(url)
    this.lambdasClient = createLambdasClient({ url: `${url}/lambdas`, fetcher: createFetchComponent() });
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
    console.log("> Calling fetchProfile")
    if (options.useCache && address in this.cache) {
      return this.cache[address]
    }

    this.cache[address] = this.lambdasClient
      .getAvatarsDetailsByPost({ids: [address.toLowerCase()]})
      .then(profiles => profiles[0] as any) // `as any` instead of mapping the catalasty-client type to dapps Profile

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
