import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { ButtonProps } from 'decentraland-ui/dist/components/Button/Button'

export type Props = ButtonProps & {
  chainId: ChainId
}
