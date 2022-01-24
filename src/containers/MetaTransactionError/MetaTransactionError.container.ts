import { connect } from 'react-redux'
import { switchNetworkRequest } from '../../modules/wallet/actions'
import { MapDispatchProps, MapDispatch } from './MetaTransactionError.types'
import MetaTransactionError from './MetaTransactionError'

const mapState = (_state: any) => ({})

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onSwitchNetwork: chainId => dispatch(switchNetworkRequest(chainId))
})

export default connect(mapState, mapDispatch)(MetaTransactionError)
