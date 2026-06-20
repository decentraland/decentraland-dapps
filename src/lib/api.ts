export type APIMethod = string
export interface APIParam {
  [key: string]: any
}

interface Response {
  ok: boolean
  data: any
  error: string
}

export interface RetryParams {
  /** Number of retry attempts for request, default in 0 */
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

  async request(method: APIMethod, path: string, params: APIParam | null = null, requestInit: RequestInit = {}, retryParams?: RetryParams) {
    const retry = retryParams ?? this.retry
    let url = this.getUrl(path)
    const init: RequestInit = {
      ...requestInit,
      method: method?.toUpperCase()
    }

    if (params) {
      if (method?.toLowerCase() === 'get') {
        const query = new URLSearchParams(params).toString()
        if (query) {
          url += (url.includes('?') ? '&' : '?') + query
        }
      } else {
        init.body = JSON.stringify(params)
        init.headers = {
          'Content-Type': 'application/json',
          ...requestInit.headers
        }
      }
    }

    let attempts = 0

    while (true) {
      try {
        const response = await fetch(url, init)

        if (!response.ok) {
          throw new Error(`Request failed with status code ${response.status}`)
        }

        const { ok, data, error } = await this.parseResponse(response)

        return !ok || error ? Promise.reject({ message: error, data }) : data
      } catch (error) {
        console.error(`[API] HTTP request failed: ${error.message || ''}`, error)
        if (retry.attempts <= attempts) throw error
        attempts++
      }
      await this.sleep(retry.delay)
    }
  }

  getUrl(path: string) {
    return `${this.url}${path}`
  }

  private async parseResponse(response: globalThis.Response): Promise<Response> {
    const text = await response.text()
    let parsed: any = text

    if (text) {
      try {
        parsed = JSON.parse(text)
      } catch {
        parsed = text
      }
    }

    if (parsed && typeof parsed.ok === 'boolean') {
      return parsed
    }

    return { ok: true, data: parsed, error: '' }
  }
}
