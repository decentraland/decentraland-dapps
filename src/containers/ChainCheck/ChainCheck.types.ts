import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'

export type Props = {
  chainId: ChainId
  children: (enabled: boolean) => React.ReactNode
}
