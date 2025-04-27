import { BaseClient, BaseClientConfig } from '../../lib'
import { CreditsResponse } from './types'

export class CreditsClient extends BaseClient {
  constructor(public readonly url: string, config?: BaseClientConfig) {
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

  createSSEConnection(
    address: string,
    onMessage: (data: CreditsResponse) => void,
    onError: (error: Event) => void
  ): EventSource {
    const eventSource = new EventSource(
      `${this.url}/users/${address}/credits/stream`
    )

    eventSource.onmessage = event => {
      try {
        const data = JSON.parse(event.data) as CreditsResponse
        onMessage(data)
      } catch (error) {
        console.error('Error parsing SSE event data:', error)
      }
    }

    eventSource.onerror = error => {
      console.error('SSE connection error:', error)
      onError(error)
    }

    return eventSource
  }
}
