import { fetchSingleApplicationFeatures } from '../../modules/features/utils'
import { ApplicationName, FeatureName } from '../../modules/features/types'

/**
 * Intended to be used as a singleton so the feature flag is only fetched once.
 */
export class FetchIsWalletConnectV2Enabled {
  private isWalletConnectV2Enabled: boolean | null = null
  private fetchIsWalletConnectV2EnabledPromise: Promise<boolean> | null = null

  exec = async (): Promise<boolean> => {
    // If the result is already in memory, return it immediately.
    if (this.isWalletConnectV2Enabled !== null) {
      return this.isWalletConnectV2Enabled
    }

    // Only fetch the feature flag the first time this function is called.
    // Any other call will subscribe to the result of a single promise.
    if (!this.fetchIsWalletConnectV2EnabledPromise) {
      this.fetchIsWalletConnectV2EnabledPromise = fetchSingleApplicationFeatures(
        ApplicationName.DAPPS
      ).then(result => {
        this.isWalletConnectV2Enabled = !!result.flags[
          `${ApplicationName.DAPPS}-${FeatureName.WALLET_CONNECT_V2}`
        ]

        return this.isWalletConnectV2Enabled
      })
    }

    return this.fetchIsWalletConnectV2EnabledPromise
  }
}
