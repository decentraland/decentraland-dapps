import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'

const httpClient = axios.create()

export type APIMethod = AxiosRequestConfig['method']
export interface APIParam {
  [key: string]: any
}

interface Response {
  ok: boolean
  data: any
  error: string
}

export interface RetryParams {
  /** Amount of retry attempts for request, default in 0 */
  attempts: number
  delay: number
}

export class BaseAPI {
  constructor(
    public url: string,
    private retry: RetryParams = { attempts: 0, delay: 1000 }
  ) {}

  private sleep = (delay: number) =>
    new Promise(resolve => {
      setTimeout(resolve, delay)
    })

  async request(
    method: APIMethod,
    path: string,
    params: APIParam | null = null,
    axiosRequestConfig: AxiosRequestConfig = {},
    retryParams?: RetryParams
  ) {
    const retry = retryParams ?? this.retry
    let options: AxiosRequestConfig = {
      ...axiosRequestConfig,
      method,
      url: this.getUrl(path)
    }

    if (params) {
      if (method?.toLowerCase() === 'get') {
        options.params = params
      } else {
        options.data = params
      }
    }

    let attempts = 0

    while (true) {
      try {
        const axiosResponse = await httpClient.request(options)
        const { ok, data, error } = this.parseResponse(axiosResponse)

        return !ok || error ? Promise.reject({ message: error, data }) : data
      } catch (error) {
        console.error(
          `[API] HTTP request failed: ${error.message || ''}`,
          error
        )
        if (retry.attempts <= attempts) throw error
        attempts++
      }
      await this.sleep(retry.delay)
    }
  }

  getUrl(path: string) {
    return `${this.url}${path}`
  }

  private parseResponse(axiosResponse: AxiosResponse): Response {
    const response = axiosResponse.data

    if (typeof response.ok === 'boolean') {
      return response
    }

    return { ok: true, data: response, error: '' }
  }
}
