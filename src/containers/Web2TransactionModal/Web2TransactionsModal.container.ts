import { connect } from 'react-redux'
import { getData as getWallet } from '../../modules/wallet/selectors'
import { getIsFeatureEnabled } from '../../modules/features/selectors'
import { ApplicationName, FeatureName } from '../../modules/features'
import { MapStateProps } from './Web2TransactionsModal.types'
import { Web2TransactionsModal } from './Web2TransactionsModal'
import { RootState } from '../../types'

const mapState = (state: RootState): MapStateProps => {
  return {
    wallet: getWallet(state),
    isMagicAutoSignEnabled: getIsFeatureEnabled(
      state,
      ApplicationName.DAPPS,
      FeatureName.MAGIC_AUTO_SIGN
    )
  }
}

export default connect(mapState)(Web2TransactionsModal)
