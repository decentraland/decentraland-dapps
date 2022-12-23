import { Dispatch } from 'redux'
import { Network } from '@dcl/schemas'
import { NetworkGatewayType } from 'decentraland-ui/dist/components/BuyManaWithFiatModal/Network'
import { Purchase } from '../../../modules/mana/types'
import {
  openManaFiatGatewayRequest,
  OpenManaFiatGatewayRequestAction
} from '../../../modules/manaFiatGateway/actions'
import { ModalProps } from '../../../providers/ModalProvider/ModalProvider.types'
import { openModal, OpenModalAction } from '../../../modules/modal/actions'

export type Metadata = {
  purchase: Purchase
  goToUrl?: string
  transactionUrl?: string
}

export type Props = Omit<ModalProps, 'metadata'> & {
  metadata: Metadata
  onTryAgain: (
    network: Network,
    gateway: NetworkGatewayType
  ) => ReturnType<typeof openManaFiatGatewayRequest>

  onSelectOtherProvider: (
    selectedNetwork: Network
  ) => ReturnType<typeof openModal>
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapDispatchProps = Pick<
  Props,
  'onTryAgain' | 'onSelectOtherProvider'
>
export type MapDispatch = Dispatch<
  OpenModalAction | OpenManaFiatGatewayRequestAction
>
