import { ProviderType } from '@dcl/schemas'
import { connection } from 'decentraland-connect'
import { FetchIsWalletConnectV2Enabled } from './FetchIsWalletConnectV2EnabledWrapper'

/**
 * Depending on the version of Wallet Connect required, it will disconnect the current connection if it is not using the correct version.
 */
export class TryPreviousConnection {
  constructor(
    private fetchIsWalletConnectV2Enabled: typeof FetchIsWalletConnectV2Enabled.prototype['exec']
  ) {}

  exec = async (): ReturnType<typeof connection['tryPreviousConnection']> => {
    const connectionData = connection.getConnectionData()
    const providerType = connectionData?.providerType

    // The logic is only required when the connected provider is Wallet Connect.
    // Otherwise, it will just try to reconnect as usual.
    if (
      providerType &&
      (providerType === ProviderType.WALLET_CONNECT ||
        providerType === ProviderType.WALLET_CONNECT_V2)
    ) {
      const isWalletConnectV2Enabled = await this.fetchIsWalletConnectV2Enabled()

      // Disconnect if the current Wallet Connect connection is using a different version.
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
}
