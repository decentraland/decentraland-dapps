import { ChainId } from '@dcl/schemas'

export type Props = {
  chainId: ChainId
  children: (enabled: boolean) => React.ReactNode
}
