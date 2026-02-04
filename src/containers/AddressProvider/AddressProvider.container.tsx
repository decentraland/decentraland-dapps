import { connect } from 'react-redux'
import { getAppChainId } from '../../modules/wallet/selectors'
import AddressProvider from './AddressProvider'
import { MapStateProps } from './AddressProvider.types'

const mapState = (state: any): MapStateProps => ({
  chainId: getAppChainId(state)
})

export default connect(mapState)(AddressProvider)
