import nock from 'nock'
import { ethers } from 'ethers'
import { Wallet } from '@ethersproject/wallet'

import { BaseClient, BaseClientConfig } from './BaseClient'
import { AuthIdentity, SignedRequestInit } from 'decentraland-crypto-fetch'
import {
  createIdentity,
  firstHeaderValueMatcher,
  secondHeaderValueMatcher,
  thirdHeaderValueMatcher
} from '../tests/authentication'

const urlTest = 'http://test.com'
const fakePrivateKey =
  '8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f'
const FIRST_AUTH_HEADER = 'x-identity-auth-chain-0'
const SECOND_AUTH_HEADER = 'x-identity-auth-chain-1'
const THIRD_AUTH_HEADER = 'x-identity-auth-chain-2'

nock.disableNetConnect()
class TestBaseClient extends BaseClient {
  public performRequest = (path: string, init?: SignedRequestInit) =>
    this.fetch(path, init)
}

let baseClient: TestBaseClient
let config: BaseClientConfig

jest.spyOn(console, 'error').mockReturnValue(undefined)

jest.spyOn(global, 'setTimeout').mockImplementation(func => {
  return func() as any
})

beforeEach(() => {
  config = {
    retryDelay: 1
  }
  jest.clearAllMocks()
})

describe('when the request fails with a server error', () => {
  beforeEach(() => {
    nock(urlTest)
      .get('/test')
      .reply(500, {})
      .defaultReplyHeaders({
        'Access-Control-Allow-Origin': '*'
      })
  })

  describe('and there is one attempt left', () => {
    beforeEach(() => {
      config = {
        ...config,
        retries: 1
      }
      baseClient = new TestBaseClient(urlTest, config)

      nock(urlTest)
        .get('/test')
        .reply(500, {})
        .defaultReplyHeaders({
          'Access-Control-Allow-Origin': '*'
        })
    })

    it('should retry 1 time and throw with the response error', async () => {
      await expect(baseClient.performRequest('/test')).rejects.toThrowError(
        'Request failed with status code 500'
      )
      expect(setTimeout).toHaveBeenCalledWith(
        expect.anything(),
        config.retryDelay
      )
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('and there are three attempts left', () => {
    beforeEach(() => {
      config = {
        ...config,
        retries: 3
      }
      baseClient = new TestBaseClient(urlTest, config)

      nock(urlTest)
        .get('/test')
        .times(3)
        .reply(500, {})
        .defaultReplyHeaders({
          'Access-Control-Allow-Origin': '*'
        })
    })

    it('should retry 3 times and throw with the response error', async () => {
      await expect(baseClient.performRequest('/test')).rejects.toThrowError(
        'Request failed with status code 500'
      )
      expect(setTimeout).toHaveBeenCalledWith(
        expect.anything(),
        config.retryDelay
      )
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('and there are no attempts left', () => {
    beforeEach(() => {
      config = {
        ...config,
        retries: 0
      }
      baseClient = new TestBaseClient(urlTest, config)
    })

    it('should throw an error', async () => {
      await expect(baseClient.performRequest('/test')).rejects.toThrowError(
        'Request failed with status code 500'
      )
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('and there is one attempt left that succeeds', () => {
    beforeEach(() => {
      config = {
        ...config,
        retries: 1
      }

      baseClient = new TestBaseClient(urlTest, config)

      nock(urlTest)
        .get('/test')
        .reply(200, { data: 'my test data', ok: true })
        .defaultReplyHeaders({
          'Access-Control-Allow-Origin': '*'
        })
    })
    it('should retry 1 time and resolve with the response data', async () => {
      await expect(baseClient.performRequest('/test')).resolves.toEqual(
        'my test data'
      )
      expect(setTimeout).toHaveBeenCalledWith(
        expect.anything(),
        config.retryDelay
      )
      expect(nock.isDone()).toBeTruthy()
    })
  })
})

describe('when the request fails with a client non-retryable error', () => {
  beforeEach(() => {
    nock(urlTest)
      .get('/test')
      .reply(422, {})
      .defaultReplyHeaders({
        'Access-Control-Allow-Origin': '*'
      })
  })

  describe.each([1, 3, 5])('and there is %s attempt left', retries => {
    beforeEach(() => {
      config = {
        ...config,
        retries,
        nonRetryableStatuses: [422]
      }
      baseClient = new TestBaseClient(urlTest, config)
    })

    it('should not retry, but throw with the response error as soon as the request fails', async () => {
      await expect(baseClient.performRequest('/test')).rejects.toThrowError(
        'Request failed with status code 422'
      )
      expect(nock.isDone()).toBeTruthy()
    })
  })
})

describe('when the request is successful', () => {
  describe('and it has a data property', () => {
    beforeEach(() => {
      nock.cleanAll()
      config = {
        ...config,
        retries: 0
      }
      baseClient = new TestBaseClient(urlTest, config)

      nock(urlTest)
        .get('/test')
        .reply(201, { data: 'my test data', ok: true })
        .defaultReplyHeaders({
          'Access-Control-Allow-Origin': '*'
        })
    })

    it('should resolve with the response data', async () => {
      await expect(baseClient.performRequest('/test')).resolves.toEqual(
        'my test data'
      )
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe("and it doesn't have a data property", () => {
    beforeEach(() => {
      nock.cleanAll()
      config = {
        ...config,
        retries: 0
      }
      baseClient = new TestBaseClient(urlTest, config)

      nock(urlTest)
        .get('/test')
        .reply(201, ['my test data'])
        .defaultReplyHeaders({
          'Access-Control-Allow-Origin': '*'
        })
    })

    it('should resolve with the response', async () => {
      await expect(baseClient.performRequest('/test')).resolves.toEqual([
        'my test data'
      ])
      expect(nock.isDone()).toBeTruthy()
    })
  })
})

describe('when the client is authenticated', () => {
  let wallet: Wallet
  let identity: AuthIdentity

  beforeEach(async () => {
    wallet = new ethers.Wallet(fakePrivateKey)
    identity = await createIdentity(wallet, 1000)
  })

  describe('and the authentication is given as a constant', () => {
    beforeEach(() => {
      config = {
        ...config,
        identity
      }
      baseClient = new TestBaseClient(urlTest, config)
      nock(urlTest)
        .get('/test')
        .matchHeader(FIRST_AUTH_HEADER, firstHeaderValueMatcher)
        .matchHeader(SECOND_AUTH_HEADER, secondHeaderValueMatcher)
        .matchHeader(THIRD_AUTH_HEADER, thirdHeaderValueMatcher('get', '/test'))
        .reply(201, { data: 'my test data', ok: true })
        .defaultReplyHeaders({
          'Access-Control-Allow-Origin': '*'
        })
    })

    it('should include the authentication headers and resolve with the response data', async () => {
      await expect(baseClient.performRequest('/test')).resolves.toEqual(
        'my test data'
      )
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('and the authentication is given as a function', () => {
    beforeEach(() => {
      config = {
        ...config,
        identity: () => identity
      }
      baseClient = new TestBaseClient(urlTest, config)
      nock(urlTest)
        .get('/test')
        .matchHeader(FIRST_AUTH_HEADER, firstHeaderValueMatcher)
        .matchHeader(SECOND_AUTH_HEADER, secondHeaderValueMatcher)
        .matchHeader(THIRD_AUTH_HEADER, thirdHeaderValueMatcher('get', '/test'))
        .reply(201, { data: 'my test data', ok: true })
        .defaultReplyHeaders({
          'Access-Control-Allow-Origin': '*'
        })
    })

    it('should include the authentication headers and resolve with the response data', async () => {
      await expect(baseClient.performRequest('/test')).resolves.toEqual(
        'my test data'
      )
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('and the authentication is given in the fetch', () => {
    beforeEach(() => {
      config = {
        ...config
      }
      baseClient = new TestBaseClient(urlTest, config)
      nock(urlTest)
        .get('/test')
        .matchHeader(FIRST_AUTH_HEADER, firstHeaderValueMatcher)
        .matchHeader(SECOND_AUTH_HEADER, secondHeaderValueMatcher)
        .matchHeader(THIRD_AUTH_HEADER, thirdHeaderValueMatcher('get', '/test'))
        .reply(201, { data: 'my test data', ok: true })
        .defaultReplyHeaders({
          'Access-Control-Allow-Origin': '*'
        })
    })

    it('should include the authentication headers and resolve with the response data', async () => {
      await expect(
        baseClient.performRequest('/test', { identity })
      ).resolves.toEqual('my test data')
      expect(nock.isDone()).toBeTruthy()
    })
  })
})
