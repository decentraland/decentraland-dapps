import React from 'react'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { ModalNavigation } from 'decentraland-ui/dist/components/ModalNavigation/ModalNavigation'
import Modal from '../../containers/Modal'
import { T } from '../../modules/translation/utils'
import { Props } from './UnsupportedNetworkModal.types'

const UnsupportedNetworkModal: React.FC<Props> = ({ chainName, expectedChainName, isSwitchingNetwork, onSwitchNetwork }: Props) => {
  return (
    <Modal open size="tiny">
      <ModalNavigation title={<T id="@dapps.navbar.wrong_network.header" />} />
      <Modal.Content>
        {!chainName ? (
          <T
            id="@dapps.navbar.wrong_network.message_unknown_network"
            values={{
              expectedChainName: <b>{expectedChainName}</b>
            }}
          />
        ) : (
          <T
            id="@dapps.navbar.wrong_network.message"
            values={{
              currentChainName: <b>{chainName}</b>,
              expectedChainName: <b>{expectedChainName}</b>
            }}
          />
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button primary disabled={isSwitchingNetwork} loading={isSwitchingNetwork} onClick={onSwitchNetwork}>
          <T
            id="@dapps.navbar.wrong_network.switch_button"
            values={{
              chainName: <b>{expectedChainName}</b>
            }}
          />
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default UnsupportedNetworkModal
