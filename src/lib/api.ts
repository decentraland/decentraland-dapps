import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios'

const httpClient = axios.create()

export interface APIParam {
  [key: string]: any
}
interface Response {
  ok: boolean
  data: any
  error: string
}

export class BaseAPI {
  constructor(public url: string) {}

  request(
    method: AxiosRequestConfig['method'],
    path: string,
    params: APIParam | null = null,
    axiosRequestConfig: AxiosRequestConfig = {}
  ) {
    let options: AxiosRequestConfig = {
      ...axiosRequestConfig,
      method,
      url: this.getUrl(path)
    }

    if (params) {
      if (method === 'get') {
        options.params = params
      } else {
        options.data = params
      }
    }

    return httpClient
      .request(options)
      .then((axiosResponse: AxiosResponse) => {
        const { ok, data, error } = this.parseResponse(axiosResponse)

        return !ok || error ? Promise.reject({ message: error, data }) : data
      })
      .catch((error: AxiosError) => {
        console.warn(`[API] HTTP request failed: ${error.message || ''}`, error)
        return Promise.reject(error)
      })
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
