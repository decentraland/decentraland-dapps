import { ChainName } from '@dcl/schemas/dist/dapps/chain-name'

export type Props = {
  chainName: ChainName | null
  expectedChainName: ChainName
  isSwitchingNetwork?: boolean
  onSwitchNetwork: () => void
}
