import { connect } from 'react-redux'
import { switchNetworkRequest } from '../../modules/wallet/actions'
import MetaTransactionError from './MetaTransactionError'
import { MapDispatch, MapDispatchProps } from './MetaTransactionError.types'

const mapState = (_state: any) => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSwitchNetwork: chainId => dispatch(switchNetworkRequest(chainId))
})

export default connect(mapState, mapDispatch)(MetaTransactionError)
