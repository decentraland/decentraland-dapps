import { Network } from '@dcl/schemas'

export type Props = {
  network: Network
  children: (enabled: boolean) => React.ReactNode
}
