import { BaseClient, BaseClientConfig } from '../../lib'
import { CreditsResponse } from './types'

export class CreditsClient extends BaseClient {
  constructor(url: string, config?: BaseClientConfig) {
    super(url, config)
  }
  /**
   * Fetches the credits for a user
   * @param address - The user's address
   * @returns The credits for the user
   */
  async fetchCredits(address: string): Promise<CreditsResponse> {
    try {
      const response = await this.fetch<CreditsResponse>(
        `/users/${address}/credits`
      )
      return response
    } catch (error) {
      console.error('Error fetching credits', error)
      return { credits: [], totalCredits: 0 }
    }
  }
}

// export const creditsAPI = new CreditsClient(config.get('CREDITS_SERVER_URL'))
