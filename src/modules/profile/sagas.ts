import { takeLatest, put, call, takeEvery } from 'redux-saga/effects'
import {
  ConnectWalletSuccessAction,
  CONNECT_WALLET_SUCCESS,
  CHANGE_ACCOUNT,
  ChangeAccountAction
} from '../wallet/actions'
import {
  LOAD_PROFILE_REQUEST,
  LoadProfileRequestAction,
  loadProfileSuccess,
  loadProfileFailure,
  loadProfileRequest
} from './actions'
import { Profile } from './types'
import { PeerAPI } from '../../lib/peer'

type CreateProfileSagaOptions = {
  peerUrl: string
}

export function createProfileSaga({ peerUrl }: CreateProfileSagaOptions) {
  const peerApi = new PeerAPI(peerUrl)
  function* profileSaga() {
    yield takeEvery(LOAD_PROFILE_REQUEST, handleLoadProfileRequest)
    yield takeLatest(CONNECT_WALLET_SUCCESS, handleWallet)
    yield takeLatest(CHANGE_ACCOUNT, handleWallet)
  }

  function* handleLoadProfileRequest(action: LoadProfileRequestAction) {
    const { address } = action.payload
    try {
      const profile: Profile = yield call(() => peerApi.fetchProfile(address))
      yield put(loadProfileSuccess(address, profile))
    } catch (error) {
      yield put(loadProfileFailure(address, error.message))
    }
  }

  function* handleWallet(
    action: ConnectWalletSuccessAction | ChangeAccountAction
  ) {
    yield put(loadProfileRequest(action.payload.wallet.address))
  }

  return profileSaga
}
