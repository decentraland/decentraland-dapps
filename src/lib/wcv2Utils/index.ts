import { FetchIsWalletConnectV2Enabled } from './FetchIsWalletConnectV2EnabledWrapper'
import { TryPreviousConnection } from './TryPreviousConnectionWrapper'

/**
 * Provides functions used to easily handle the migration from Wallet Connect V1 to Wallet Connect V2.
 * The `wcv2Utils` directory is intended to be temporary.
 * When the migration to Wallet Connect V2 is definitive, the whole directory should be deleted and usage reverted to its previous state.
 */

export const fetchIsWalletConnectV2Enabled = new FetchIsWalletConnectV2Enabled()
  .exec

export const tryPreviousConnection = new TryPreviousConnection(
  fetchIsWalletConnectV2Enabled
).exec
