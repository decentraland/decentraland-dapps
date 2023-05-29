import { ProviderType } from '@dcl/schemas'
import { connection } from 'decentraland-connect'
import { fetchSingleApplicationFeatures } from '../modules/features/utils'
import { ApplicationName, FeatureName } from '../modules/features/types'

class TryPreviousConnectionWrapper {
  private isWalletConnectV2Enabled: boolean | null = null
  private fetchIsWalletConnectV2EnabledPromise: Promise<boolean> | null = null

  tryPreviousConnection = async (): ReturnType<
    typeof connection['tryPreviousConnection']
  > => {
    const connectionData = connection.getConnectionData()
    const providerType = connectionData?.providerType

    if (
      providerType &&
      (providerType === ProviderType.WALLET_CONNECT ||
        providerType === ProviderType.WALLET_CONNECT_V2)
    ) {
      const isWalletConnectV2Enabled = await this.getIsWalletConnectV2Enabled()

      if (
        (isWalletConnectV2Enabled &&
          providerType === ProviderType.WALLET_CONNECT) ||
        (!isWalletConnectV2Enabled &&
          providerType === ProviderType.WALLET_CONNECT_V2)
      ) {
        await connection.disconnect()
      }
    }

    return connection.tryPreviousConnection()
  }

  private getIsWalletConnectV2Enabled = async (): Promise<boolean> => {
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

export const tryPreviousConnectionWrapper = new TryPreviousConnectionWrapper()
