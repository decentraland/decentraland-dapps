import { fetchSingleApplicationFeatures } from '../../modules/features/utils'
import { ApplicationName, FeatureName } from '../../modules/features/types'

export class FetchIsWalletConnectV2Enabled {
  private isWalletConnectV2Enabled: boolean | null = null
  private fetchIsWalletConnectV2EnabledPromise: Promise<boolean> | null = null

  exec = async (): Promise<boolean> => {
    if (this.isWalletConnectV2Enabled !== null) {
      return this.isWalletConnectV2Enabled
    }

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
