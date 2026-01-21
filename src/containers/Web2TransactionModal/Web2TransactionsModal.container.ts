import { connect } from 'react-redux'
import { ApplicationName, FeatureName } from '../../modules/features'
import { getIsFeatureEnabled } from '../../modules/features/selectors'
import { getData as getWallet } from '../../modules/wallet/selectors'
import { RootStateOrAny } from '../../types'
import { Web2TransactionsModal } from './Web2TransactionsModal'
import { MapStateProps } from './Web2TransactionsModal.types'

const mapState = (state: RootStateOrAny): MapStateProps => {
  return {
    wallet: getWallet(state),
    isMagicAutoSignEnabled: getIsFeatureEnabled(
      state,
      ApplicationName.DAPPS,
      FeatureName.MAGIC_AUTO_SIGN,
    ),
  }
}

export default connect(mapState)(Web2TransactionsModal)
