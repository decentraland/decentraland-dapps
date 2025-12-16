import React from 'react'
import { ChainId, getNetwork } from '@dcl/schemas/dist/dapps/chain-id'
import { ToastType } from 'decentraland-ui'
import { getNetworkName } from 'decentraland-ui/dist/lib/network'
import { Toast } from '../types'
import { t } from '../../translation/utils'

export function getSwitchChainErrorToast(chainId: ChainId): Omit<Toast, 'id'> {
  return {
    type: ToastType.ERROR,
    title: t('@dapps.toasts.switch_network_error.title'),
    body: (
      <div>
        {t('@dapps.toasts.switch_network_error.body', {
          network: getNetworkName(getNetwork(chainId))
        })}
      </div>
    ),
    closable: true,
    timeout: 30000
  }
}
