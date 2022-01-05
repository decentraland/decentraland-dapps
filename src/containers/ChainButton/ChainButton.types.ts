import { ButtonProps } from 'decentraland-ui/dist/components/Button/Button'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'

export type Props = ButtonProps & {
  chainId: ChainId
}
