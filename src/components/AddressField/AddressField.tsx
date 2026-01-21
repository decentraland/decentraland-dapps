import {
  AddressFieldProps,
  AddressField as AddressFieldUI,
} from 'decentraland-ui/dist/components/AddressField'
import { resolveName } from './utils'

type Props = Omit<AddressFieldProps, 'resolveName'>

export function AddressField(props: Props) {
  return <AddressFieldUI {...props} resolveName={resolveName} />
}
