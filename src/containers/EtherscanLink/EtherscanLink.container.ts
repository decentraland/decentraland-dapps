import { connect } from 'react-redux'
import { getNetwork } from '../../modules/wallet/selectors'
import EtherscanLink from './EtherscanLink'
import { EtherscanLinkProps } from './types'

const mapState = (state: any): Partial<EtherscanLinkProps> => {
  return {
    network: getNetwork(state)
  }
}

const mapDispatch = (_: any): Partial<EtherscanLinkProps> => ({})

export default connect<Partial<EtherscanLinkProps>>(mapState, mapDispatch)(
  EtherscanLink as any
) as any
