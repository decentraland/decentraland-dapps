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
      .then((response: AxiosResponse<Response>) => {
        const data = response.data
        const result = data.data // One for axios data, another for the servers data

        const error = this.getResponseError(data)

        return error ? Promise.reject({ message: error, data: result }) : result
      })
      .catch((error: AxiosError) => {
        console.warn(`[API] HTTP request failed: ${error.message || ''}`, error)
        return Promise.reject(error)
      })
  }

  getUrl(path: string) {
    return `${this.url}${path}`
  }

  getResponseError(data: any): string | undefined {
    if (data && !data.ok) {
      return data.error
    }
    return undefined
  }
}
