import nodeURL from 'url'
import {
  type AuthIdentity,
  type SignedRequestInit,
  signedFetchFactory,
} from 'decentraland-crypto-fetch'
import { ClientError } from './ClientError'

const DEFAULT_RETRIES = 3
const DEFAULT_RETRY_DELAY = 1000
const DEFAULT_NON_RETRYABLE_STATUSES = [400, 401, 403, 404, 409, 422]
const URL = globalThis?.URL ?? nodeURL.URL

export type BaseClientConfig = {
  identity?: AuthIdentity | ((...args: unknown[]) => AuthIdentity | undefined)
  /** The number of retries if the request fails */
  retries?: number
  /** The delay between retries if the request fails */
  retryDelay?: number
  /** The status numbers that would not be retried */
  nonRetryableStatuses?: number[]
}

export abstract class BaseClient {
  protected readonly baseUrl: string
  private readonly retries: number
  private readonly retryDelay: number
  private readonly nonRetryableStatuses: number[]
  private readonly identity:
    | AuthIdentity
    | ((...args: unknown[]) => AuthIdentity | undefined)
    | undefined

  constructor(url: string, config?: BaseClientConfig) {
    this.baseUrl = url
    this.identity = config?.identity
    this.retries = config?.retries ?? DEFAULT_RETRIES
    this.retryDelay = config?.retryDelay ?? DEFAULT_RETRY_DELAY
    this.nonRetryableStatuses =
      config?.nonRetryableStatuses ?? DEFAULT_NON_RETRYABLE_STATUSES
  }

  private sleep = (delay: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, delay)
    })

  protected getIdentity = () =>
    this.identity instanceof Function ? this.identity() : this.identity

  protected rawFetch = (
    path: string,
    init?: SignedRequestInit,
  ): Promise<Response> => {
    const fullUrl = new URL(path, this.baseUrl)
    const identity = init?.identity ?? this.getIdentity()
    const signedFetch = signedFetchFactory()
    return signedFetch(fullUrl.toString(), { ...init, identity })
  }

  protected fetch = async <T>(
    path: string,
    init?: SignedRequestInit,
  ): Promise<T> => {
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        let response: Response
        let parsedResponse: any
        try {
          response = await this.rawFetch(path, init)
          const bodyText = await response.text()
          if (bodyText.length === 0) {
            parsedResponse = { ok: true, data: null }
          } else {
            parsedResponse = JSON.parse(bodyText)
          }
        } catch (error) {
          throw new ClientError(error.message, undefined, null)
        }

        if (!response.ok || parsedResponse.ok === false) {
          const errorMessage: string | undefined =
            parsedResponse.message ?? parsedResponse.error
          throw new ClientError(
            errorMessage ??
              `Request failed with status code ${response.status}`,
            response.status,
            parsedResponse.data,
          )
        }

        if (parsedResponse.ok === true) {
          return parsedResponse.data as T
        } else {
          return parsedResponse as T
        }
      } catch (error) {
        console.error(
          `[API] HTTP request failed: ${error.message || ''}`,
          error,
        )
        if (
          this.retries === attempt ||
          (error.status && this.nonRetryableStatuses.includes(error.status))
        )
          throw error
        await this.sleep(this.retryDelay)
      }
    }
    throw new Error('Unreachable code')
  }
}
