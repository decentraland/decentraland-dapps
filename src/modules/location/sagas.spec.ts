import { expectSaga } from 'redux-saga-test-plan'
import { select } from '@redux-saga/core/effects'
import { getLocation, onLocationChanged, replace } from 'connected-react-router'
import { Location } from 'history'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { manaFiatGatewayPurchaseCompleted } from '../manaFiatGateway/actions'
import { MoonPayTransactionStatus } from '../manaFiatGateway/moonpay/types'
import { locations } from '../locations'
import { locationSaga } from './sagas'

describe('when handling location change', () => {
  const mockTransactionId = 'transactionId'
  const mockTransactionStatus = MoonPayTransactionStatus.PENDING

  const mockLocation: Location = {
    pathname: '/pathname',
    search: '',
    state: null,
    hash: 'Hash'
  }

  describe('when location query has network, gateway, transaction id and status', () => {
    describe('when they are the only query params', () => {
      describe('when the pathname is /', () => {
        it('should put the action signaling the completion of the purchase and the removing of those params from the url', () => {
          return expectSaga(locationSaga)
            .provide([
              [
                select(getLocation),
                {
                  pathname: locations.root(),
                  query: {
                    network: Network.ETHEREUM,
                    gateway: NetworkGatewayType.MOON_PAY,
                    transactionId: mockTransactionId,
                    transactionStatus: mockTransactionStatus
                  }
                }
              ]
            ])
            .put(
              manaFiatGatewayPurchaseCompleted(
                Network.ETHEREUM,
                NetworkGatewayType.MOON_PAY,
                mockTransactionId,
                mockTransactionStatus
              )
            )
            .put(replace(`${location.pathname}?`))
            .dispatch(onLocationChanged(mockLocation, 'PUSH'))
            .silentRun()
        })
      })

      describe('when the pathname is not root', () => {
        it('should put the action signaling the completion of the purchase and the removing of those params from the url without changing the pathname', () => {
          return expectSaga(locationSaga)
            .provide([
              [
                select(getLocation),
                {
                  pathname: `${locations.root()}/pathname`,
                  query: {
                    network: Network.ETHEREUM,
                    gateway: NetworkGatewayType.MOON_PAY,
                    transactionId: mockTransactionId,
                    transactionStatus: mockTransactionStatus
                  }
                }
              ]
            ])
            .put(
              manaFiatGatewayPurchaseCompleted(
                Network.ETHEREUM,
                NetworkGatewayType.MOON_PAY,
                mockTransactionId,
                mockTransactionStatus
              )
            )
            .put(replace(`${location.pathname}?`))
            .dispatch(onLocationChanged(mockLocation, 'PUSH'))
            .silentRun()
        })
      })
    })

    describe('when there are more query params', () => {
      const extraQueryParams = {
        q1: 'I am a query param',
        q2: 'I am also a query parameter'
      }

      describe('when the pathname is /', () => {
        it('should put the action signaling the completion of the purchase and the removing of those params from the url without removing the others', () => {
          return expectSaga(locationSaga)
            .provide([
              [
                select(getLocation),
                {
                  pathname: locations.root(),
                  query: {
                    ...extraQueryParams,
                    network: Network.ETHEREUM,
                    gateway: NetworkGatewayType.MOON_PAY,
                    transactionId: mockTransactionId,
                    transactionStatus: mockTransactionStatus
                  }
                }
              ]
            ])
            .put(
              manaFiatGatewayPurchaseCompleted(
                Network.ETHEREUM,
                NetworkGatewayType.MOON_PAY,
                mockTransactionId,
                mockTransactionStatus
              )
            )
            .put(
              replace(
                `${location.pathname}?${new URLSearchParams(
                  extraQueryParams
                ).toString()}`
              )
            )
            .dispatch(onLocationChanged(mockLocation, 'PUSH'))
            .silentRun()
        })
      })

      describe('when the pathname is not root', () => {
        it('should put the action signaling the completion of the purchase and the removing of those params from the url without removing the others nor changing the pathname', () => {
          return expectSaga(locationSaga)
            .provide([
              [
                select(getLocation),
                {
                  pathname: `${locations.root()}/pathname`,
                  query: {
                    ...extraQueryParams,
                    network: Network.ETHEREUM,
                    gateway: NetworkGatewayType.MOON_PAY,
                    transactionId: mockTransactionId,
                    transactionStatus: mockTransactionStatus
                  }
                }
              ]
            ])
            .put(
              manaFiatGatewayPurchaseCompleted(
                Network.ETHEREUM,
                NetworkGatewayType.MOON_PAY,
                mockTransactionId,
                mockTransactionStatus
              )
            )
            .put(
              replace(
                `${location.pathname}?${new URLSearchParams(
                  extraQueryParams
                ).toString()}`
              )
            )
            .dispatch(onLocationChanged(mockLocation, 'PUSH'))
            .silentRun()
        })
      })
    })
  })

  describe('when the query misses any of network, gateway, transaction id or status', () => {
    it('should not put the action signaling the completion of the purchase', () => {
      return expectSaga(locationSaga)
        .provide([
          [
            select(getLocation),
            {
              pathname: locations.root(),
              query: {}
            }
          ]
        ])
        .dispatch(onLocationChanged(mockLocation, 'PUSH'))
        .silentRun()
        .then(({ effects }) => {
          expect(effects.put).toBeUndefined()
        })
    })
  })
})
