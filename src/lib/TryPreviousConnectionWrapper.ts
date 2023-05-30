import { ProviderType } from '@dcl/schemas'
import { connection } from 'decentraland-connect'
import { fetchIsWalletConnectV2EnabledWrapper } from './FetchIsWalletConnectV2EnabledWrapper'

class TryPreviousConnectionWrapper {
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
      const isWalletConnectV2Enabled = await fetchIsWalletConnectV2EnabledWrapper.fetchIsWalletConnectV2Enabled()

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

export const tryPreviousConnectionWrapper = new TryPreviousConnectionWrapper()
