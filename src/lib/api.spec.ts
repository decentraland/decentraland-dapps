import nock from 'nock';
import axios from 'axios';

import { BaseAPI, RetryParams } from './api';

axios.defaults.adapter = require('axios/lib/adapters/http');


const urlTest = 'http://test.com'

nock.disableNetConnect()

describe('when making requests and the requests fails', () => {

  beforeEach(() => {

    nock(urlTest)
      .get('/test')
      .reply(500, {})
      .defaultReplyHeaders({
        "Access-Control-Allow-Origin": "*"
      })

  })

  describe('and there are one attempts left', () => {
    let baseApi: BaseAPI;
    beforeEach(() => {
      const retry: RetryParams = {
        attempts: 1,
        delay: 10
      }

      baseApi = new BaseAPI(urlTest, retry)

      nock(urlTest)
        .get('/test')
        .reply(500, {})
        .defaultReplyHeaders({
          "Access-Control-Allow-Origin": "*"
        })
    })
    it('should retry 1 time', async () => {
      await expect(baseApi.request('get', '/test')).rejects.toThrowError("Request failed with status code 500")
      expect(nock.isDone()).toBeTruthy()
    })
  })
  describe('and there are three attempts left', () => {
    let baseApi: BaseAPI;
    beforeEach(() => {
      const retry: RetryParams = {
        attempts: 3,
        delay: 10
      }

      baseApi = new BaseAPI(urlTest, retry)

      nock(urlTest)
        .get('/test')
        .times(3)
        .reply(500, {})
        .defaultReplyHeaders({
          "Access-Control-Allow-Origin": "*"
        })
    })
    it('should retry 1 time', async () => {
      await expect(baseApi.request('get', '/test')).rejects.toThrowError("Request failed with status code 500")
      expect(nock.isDone()).toBeTruthy()
    })
  })
  describe('and there are no attempts left', () => {
    let baseApi: BaseAPI;
    beforeEach(() => {
      const retry: RetryParams = {
        attempts: 0,
        delay: 10
      }

      baseApi = new BaseAPI(urlTest, retry)
    })

    it('should throw an error', async () => {
      await expect(baseApi.request('get', '/test')).rejects.toThrowError("Request failed with status code 500")
      expect(nock.isDone()).toBeTruthy()
    })
  })
  describe('and there is one attempt left that succeeds', () => {
    let baseApi: BaseAPI;
    beforeEach(() => {
      const retry: RetryParams = {
        attempts: 1,
        delay: 10
      }

      baseApi = new BaseAPI(urlTest, retry)

      nock(urlTest)
        .get('/test')
        .reply(200, { data: 'my test data', ok: true })
        .defaultReplyHeaders({
          "Access-Control-Allow-Origin": "*"
        })
    })
    it('should retry 1 time', async () => {
      await expect(baseApi.request('get', '/test')).resolves.toEqual('my test data')

      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('when making requests and the requests succeds', () => {

    let baseApi: BaseAPI

    beforeEach(() => {
      nock.cleanAll()

      const retry: RetryParams = {
        attempts: 0,
        delay: 10
      }

      baseApi = new BaseAPI(urlTest, retry)

      nock(urlTest)
        .get('/test')
        .reply(201, { data: 'my test data', ok: true })
        .defaultReplyHeaders({
          "Access-Control-Allow-Origin": "*"
        })
    })

    it('should throw an error', async () => {
      await expect(baseApi.request('get', '/test')).resolves.toEqual('my test data')
      expect(nock.isDone()).toBeTruthy()
    })

  })
})
