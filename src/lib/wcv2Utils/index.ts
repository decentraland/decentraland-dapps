import { FetchIsWalletConnectV2Enabled } from './FetchIsWalletConnectV2EnabledWrapper'
import { TryPreviousConnection } from './TryPreviousConnectionWrapper'

export const fetchIsWalletConnectV2Enabled = new FetchIsWalletConnectV2Enabled()
  .exec

export const tryPreviousConnection = new TryPreviousConnection(
  fetchIsWalletConnectV2Enabled
).exec
