import { ChainId } from '@dcl/schemas'
import { loadingReducer } from '../loading/reducer'
import {
  ConnectWalletFailureAction,
  ConnectWalletRequestAction,
  EnableWalletFailureAction,
  EnableWalletRequestAction,
  EnableWalletSuccessAction,
  FetchWalletFailureAction,
  FetchWalletRequestAction,
  changeAccount,
  changeNetwork,
  connectWalletFailure,
  connectWalletRequest,
  connectWalletSuccess,
  disconnectWallet,
  enableWalletFailure,
  enableWalletRequest,
  enableWalletSuccess,
  fetchWalletFailure,
  fetchWalletRequest,
  fetchWalletSuccess,
  setAppChainId
} from './actions'
import { INITIAL_STATE, WalletState, walletReducer } from './reducer'
import { ProviderType, Wallet } from './types'

const chainId = ChainId.ETHEREUM_GOERLI
const error = 'anErrorMessage'
const providerType = ProviderType.INJECTED
const wallet = {} as Wallet

const requestActions = [
  fetchWalletRequest(),
  enableWalletRequest(providerType),
  connectWalletRequest()
]

beforeEach(() => {})

describe.each(requestActions)('when reducing the "$type" action', action => {
  let initialState: WalletState

  beforeEach(() => {
    initialState = {
      ...INITIAL_STATE,
      loading: []
    }
  })

  it('should return a state with the loading set', () => {
    expect(walletReducer(initialState, action)).toEqual({
      ...INITIAL_STATE,
      loading: loadingReducer(initialState.loading, action)
    })
  })
})

const fetchAndConnectSuccessActions = [
  {
    action: 'fetching the wallet',
    request: fetchWalletRequest,
    success: fetchWalletSuccess
  },
  {
    action: 'connecting the wallet',
    request: connectWalletRequest,
    success: connectWalletSuccess
  }
]

describe.each(fetchAndConnectSuccessActions)(
  `when reducing the successful action of $action`,
  ({ request, success }) => {
    let initialState: WalletState

    beforeEach(() => {
      initialState = {
        ...INITIAL_STATE,
        loading: loadingReducer([], request())
      }
    })

    it('should return a state with the error and loading state clear and the new wallet as the data', () => {
      expect(walletReducer(initialState, success(wallet))).toEqual({
        ...INITIAL_STATE,
        loading: [],
        error: null,
        data: wallet
      })
    })
  }
)

describe(`when reducing the successful action of enabling the wallet`, () => {
  let initialState: WalletState

  let requestAction: EnableWalletRequestAction
  let successAction: EnableWalletSuccessAction

  beforeEach(() => {
    requestAction = enableWalletRequest(providerType)
    successAction = enableWalletSuccess(providerType)

    initialState = {
      ...INITIAL_STATE,
      loading: loadingReducer([], requestAction)
    }
  })

  it('should return a state with the loading and error cleared', () => {
    expect(walletReducer(initialState, successAction)).toEqual({
      ...initialState,
      loading: [],
      error: null
    })
  })
})

describe('when reducing the failure action of fetching the wallet', () => {
  let initialState: WalletState

  let requestAction: FetchWalletRequestAction
  let failureAction: FetchWalletFailureAction

  beforeEach(() => {
    requestAction = fetchWalletRequest()
    failureAction = fetchWalletFailure(error)

    initialState = {
      ...INITIAL_STATE,
      loading: loadingReducer([], requestAction)
    }
  })

  it('should return a state with loading state cleared', () => {
    expect(walletReducer(initialState, failureAction)).toEqual({
      ...INITIAL_STATE,
      loading: []
    })
  })
})

describe('when reducing the failure action of connecting the wallet', () => {
  let initialState: WalletState

  let requestAction: ConnectWalletRequestAction
  let failureAction: ConnectWalletFailureAction

  beforeEach(() => {
    requestAction = connectWalletRequest()
    failureAction = connectWalletFailure(error)

    initialState = {
      ...INITIAL_STATE,
      loading: loadingReducer([], requestAction),
      data: wallet
    }
  })

  it('should return a state with the loading state and data cleared', () => {
    expect(walletReducer(initialState, failureAction)).toEqual({
      ...INITIAL_STATE,
      loading: [],
      data: null
    })
  })
})

describe('when reducing the failure action of enabling the wallet', () => {
  let initialState: WalletState

  let requestAction: EnableWalletRequestAction
  let failureAction: EnableWalletFailureAction

  beforeEach(() => {
    requestAction = enableWalletRequest(providerType)
    failureAction = enableWalletFailure(error)

    initialState = {
      ...INITIAL_STATE,
      error: null,
      loading: loadingReducer([], requestAction),
      data: wallet
    }
  })

  it('should return a state with the error set and the loading state and data cleared', () => {
    expect(walletReducer(initialState, failureAction)).toEqual({
      ...INITIAL_STATE,
      error,
      loading: [],
      data: null
    })
  })
})

describe.each([changeAccount(wallet), changeNetwork(wallet)])(
  'when reducing the $type action',
  action => {
    let initialState: WalletState

    beforeEach(() => {
      initialState = {
        ...INITIAL_STATE,
        error,
        data: null
      }
    })

    it('should return a state with the error state cleared and the wallet in the data state', () => {
      expect(walletReducer(initialState, action)).toEqual({
        ...INITIAL_STATE,
        error: null,
        data: wallet
      })
    })
  }
)

describe('when reducing the action of disconnecting the wallet', () => {
  let initialState: WalletState

  beforeEach(() => {
    initialState = {
      ...INITIAL_STATE,
      error,
      data: wallet
    }
  })

  it('should return a state with the error and data cleared', () => {
    expect(walletReducer(initialState, disconnectWallet())).toEqual({
      ...INITIAL_STATE,
      error: null,
      data: null
    })
  })
})

describe('when reducing the action of setting the app chain id', () => {
  let initialState: WalletState

  beforeEach(() => {
    initialState = {
      ...INITIAL_STATE,
      appChainId: null
    }
  })

  it('should return a state with app chainId set', () => {
    expect(walletReducer(initialState, setAppChainId(chainId))).toEqual({
      ...INITIAL_STATE,
      appChainId: chainId
    })
  })
})
