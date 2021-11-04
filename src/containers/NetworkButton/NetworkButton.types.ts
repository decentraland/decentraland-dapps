import { ButtonProps } from 'decentraland-ui'
import { Network } from '@dcl/schemas'

export type Props = ButtonProps & {
  network: Network
}
