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

  /**
   * Creates an SSE connection with reconnection logic
   * @param address - The user's address
   * @param onMessage - Callback function for received messages
   * @param onError - Callback function for errors
   * @returns EventSource with auto-reconnection capabilities
   */
  createSSEConnection(
    address: string,
    onMessage: (data: CreditsResponse) => void,
    onError: (error: Event) => void
  ): EventSource {
    let eventSource: EventSource | null = null
    let retryCount = 0
    const MAX_RETRIES = 5
    const RETRY_DELAY_MS = 3000

    // Create a wrapper object that appears as an EventSource to TypeScript
    const wrapper = {} as EventSource

    const connect = () => {
      if (eventSource) {
        // Close existing connection before creating a new one
        eventSource.close()
      }

      eventSource = new EventSource(
        `${this.url}/users/${address}/credits/stream`
      )

      // Copy all properties from the real EventSource to our wrapper
      Object.defineProperties(
        wrapper,
        Object.getOwnPropertyDescriptors(eventSource)
      )

      eventSource.onopen = event => {
        // Reset retry count on successful connection
        retryCount = 0
        console.log('SSE connection established')
        // Forward the event if there's a listener on wrapper
        if (wrapper.onopen) {
          wrapper.onopen(event)
        }
      }

      eventSource.onmessage = event => {
        try {
          const data = JSON.parse(event.data) as CreditsResponse
          onMessage(data)
          // Forward the event if there's a listener on wrapper
          if (wrapper.onmessage) {
            wrapper.onmessage(event)
          }
        } catch (error) {
          console.error('Error parsing SSE event data:', error)
        }
      }

      eventSource.onerror = error => {
        console.error('SSE connection error:', error)

        // Forward the event if there's a listener on wrapper
        if (wrapper.onerror && eventSource) {
          wrapper.onerror(error)
        }

        // Close the connection
        if (eventSource) {
          eventSource.close()
        }

        // Attempt to reconnect if under max retries
        if (retryCount < MAX_RETRIES) {
          retryCount++
          console.log(
            `Reconnecting SSE (attempt ${retryCount}/${MAX_RETRIES})...`
          )
          setTimeout(connect, RETRY_DELAY_MS)
        } else {
          console.error(
            `Max SSE reconnection attempts (${MAX_RETRIES}) reached`
          )
          onError(error)
        }
      }
    }

    // Initial connection
    connect()

    // Override the close method to handle our custom cleanup
    wrapper.close = function() {
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
    }

    return wrapper
  }
}
