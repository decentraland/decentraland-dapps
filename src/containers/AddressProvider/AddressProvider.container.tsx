import { connect } from 'react-redux'
import { getAppChainId } from '../../modules/wallet/selectors'
import { MapStateProps } from './AddressProvider.types'
import AddressProvider from './AddressProvider'

const mapState = (state: any): MapStateProps => ({
  chainId: getAppChainId(state)
})

export default connect(mapState)(AddressProvider)
