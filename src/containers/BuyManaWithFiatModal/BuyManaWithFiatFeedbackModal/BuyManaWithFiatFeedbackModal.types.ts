import { Purchase } from '../../../modules/mana/types'
import { ModalProps } from '../../../providers/ModalProvider/ModalProvider.types'

export type Metadata = {
  purchase: Purchase
}

export type Props = Omit<ModalProps, 'metadata'> & {
  metadata: Metadata
}

export type OwnProps = Pick<Props, 'metadata'>
export type MapStateProps = Props
