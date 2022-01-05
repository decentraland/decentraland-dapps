import { ButtonProps } from 'decentraland-ui/dist/components/Button/Button'
import { Network } from '@dcl/schemas/dist/dapps/network'

export type Props = ButtonProps & {
  network: Network
}
