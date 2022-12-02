import { expectSaga } from 'redux-saga-test-plan'
import { select } from '@redux-saga/core/effects'
import { getLocation, onLocationChanged } from 'connected-react-router'
import { Location } from 'history'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { locations } from '../locations'
import { locationSaga } from './sagas'
import { manaFiatGatewayPurchaseCompleted } from '../manaFiatGateway/actions'

describe('when handling location change', () => {
  const mockTransactionId = 'transactionId'
  const mockTransactionStatus = 'transactionStatus'

  const mockLocation: Location = {
    pathname: '/pathname',
    search: '',
    state: null,
    hash: 'Hash'
  }

  describe('when location query has network, gateway, transaction id and status', () => {
    it('should put the action signaling the completion of the purchase with the given query parameters', () => {
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
        .dispatch(onLocationChanged(mockLocation, 'PUSH'))
        .silentRun()
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
