import { EventSource } from 'eventsource'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { BaseClient, BaseClientConfig } from '../../lib'
import {
  CreditsNameRouteResponse,
  CreditsResponse,
  SeasonResponse,
} from './types'

export class CreditsClient extends BaseClient {
  constructor(
    public readonly url: string,
    config?: BaseClientConfig,
  ) {
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
        `/users/${address}/credits`,
      )
      return response
    } catch (error) {
      console.error('Error fetching credits', error)
      return { credits: [], totalCredits: 0 }
    }
  }

  /**
   * Fetches the current season data
   * @returns The season data
   */
  async fetchSeason(): Promise<SeasonResponse | null> {
    try {
      const response = await this.fetch<SeasonResponse>('/season')
      return response
    } catch (error) {
      console.error('Error fetching season data', error)
      return null
    }
  }

  /**
   * Fetches the credits name route for claiming a NAME using credits
   * @param name - The NAME to claim
   * @param chainId - The chain ID for the transaction
   * @returns The route data for the credits transaction
   */
  async fetchCreditsNameRoute(
    name: string,
    chainId: ChainId,
  ): Promise<CreditsNameRouteResponse> {
    const response = await this.fetch<CreditsNameRouteResponse>(
      `/credits-name-route?name=${encodeURIComponent(name)}&chainId=${chainId}`,
    )
    return response
  }

  /**
   * Creates an SSE connection with reconnection logic
   * @param address - The user's address
   * @param onMessage - Callback function for received messages
   * @param onError - Callback function for errors
   * @returns Object with close method to manually disconnect
   */
  createSSEConnection(
    address: string,
    onMessage: (data: CreditsResponse) => void,
    onError: (error: Event) => void,
  ): { close: () => void } {
    let eventSource: EventSource | null = null
    let retryCount = 0
    let reconnectTimeout: number | null = null
    const MAX_RETRIES = 5
    const RETRY_DELAY_MS = 3000

    const connect = () => {
      if (eventSource) {
        // Close existing connection before creating a new one
        eventSource.close()
        eventSource = null
      }

      eventSource = new EventSource(
        `${this.url}/users/${address}/credits/stream`,
        {
          fetch: this.rawFetch.bind(this),
        },
      )

      eventSource.onopen = () => {
        // Reset retry count on successful connection
        retryCount = 0
        console.log('SSE connection established')
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as CreditsResponse
          onMessage(data)
        } catch (error) {
          console.error('Error parsing SSE event data:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)

        // Close the connection
        if (eventSource) {
          eventSource.close()
          eventSource = null
        }

        // Attempt to reconnect if under max retries
        if (retryCount < MAX_RETRIES) {
          retryCount++
          console.log(
            `Reconnecting SSE (attempt ${retryCount}/${MAX_RETRIES})...`,
          )
          // Store timeout ID so we can cancel it if needed
          reconnectTimeout = window.setTimeout(connect, RETRY_DELAY_MS)
        } else {
          console.error(
            `Max SSE reconnection attempts (${MAX_RETRIES}) reached`,
          )
          onError(error)
        }
      }
    }

    // Initial connection
    connect()

    // Return an object with a close method to allow manual disconnection
    return {
      close: () => {
        // Clear any pending reconnection attempts
        if (reconnectTimeout !== null) {
          window.clearTimeout(reconnectTimeout)
          reconnectTimeout = null
        }

        // Close the EventSource if it exists
        if (eventSource) {
          eventSource.close()
          eventSource = null
        }
      },
    }
  }
}
