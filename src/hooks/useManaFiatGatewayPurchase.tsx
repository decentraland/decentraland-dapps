import { useDispatch } from 'react-redux'
import { useHistory, useLocation } from 'react-router'
import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui'
import { manaFiatGatewayPurchaseCompleted } from '../modules/gateway'
import { MoonPayTransactionStatus } from '../modules/gateway/moonpay/types'

export default function useManaFiatGatewayPurchase() {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const network = query.get('network') as Network
  const gateway = query.get('gateway') as NetworkGatewayType
  const transactionId = query.get('transactionId') as string
  const transactionStatus = query.get('transactionStatus') as MoonPayTransactionStatus
  const history = useHistory()
  const dispatch = useDispatch()

  if (transactionId && transactionStatus && network && gateway) {
    const queryParams = new URLSearchParams(query)
    const params = ['transactionId', 'transactionStatus', 'network', 'gateway']

    params.forEach(param => queryParams.delete(param))

    history.replace(`${location.pathname}?${queryParams.toString()}`)

    dispatch(manaFiatGatewayPurchaseCompleted(network, gateway, transactionId, transactionStatus))
  }
}
