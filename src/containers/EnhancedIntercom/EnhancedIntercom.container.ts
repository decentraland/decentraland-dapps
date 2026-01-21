import { connect } from 'react-redux'
import Intercom from '../../components/Intercom/Intercom'
import { getData as getWallet } from '../../modules/wallet/selectors'
import { MapStateProps, Props } from './EnhancedIntercom.types'

const mapState = (state: any, ownProps: Props): MapStateProps => {
  const wallet = getWallet(state)
  const enhancedData: { Wallet?: string; 'Wallet type'?: string } = {}

  if (wallet?.address) {
    enhancedData['Wallet'] = wallet?.address.toLowerCase() ?? null
  }

  if (wallet?.providerType) {
    enhancedData['Wallet type'] = wallet?.providerType ?? null
  }

  return {
    data: {
      ...enhancedData,
      ...ownProps.data,
    },
  }
}

export default connect(mapState)(Intercom)
