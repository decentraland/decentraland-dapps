export enum MoonPayTransactionStatus {
  WAITING_PAYMENT = 'waitingPayment',
  PENDING = 'pending',
  WAITING_AUTHORIZATION = 'waitingAuthorization',
  FAILED = 'failed',
  COMPLETED = 'completed'
}

type Stage = {
  stage:
    | 'stage_one_ordering'
    | 'stage_two_verification'
    | 'stage_three_processing'
    | 'stage_four_delivery'
  status: 'not_started' | 'in_progress' | 'success' | 'failed'
  actions: StageAction[]
  failureReason:
    | 'card_not_supported'
    | 'daily_purchase_limit_exceeded'
    | 'payment_authorization_declined'
    | 'timeout_3d_secure'
    | 'timeout_bank_transfer'
    | 'timeout_kyc_verification'
    | 'timeout_card_verification'
    | 'rejected_kyc'
    | 'rejected_card'
    | 'rejected_other'
    | 'cancelled'
    | 'refund'
    | 'failed_testnet_withdrawal'
    | 'error'
    | null
}

type StageAction = {
  type:
    | 'complete_bank_transfer'
    | 'retry_kyc'
    | 'verify_card_by_code'
    | 'verify_card_by_file'
  url: string
}

type BaseCurrency = {
  id: string
  createdAt: string
  updatedAt: string
  type: string
  name: string
  code: string
  precision: number
  maxAmount: number
  minAmount: number
  minBuyAmount: number
  maxBuyAmount: number
}

type Currency = {
  id: string
  createdAt: string
  updatedAt: string
  type: string
  name: string
  code: string
  precision: number
  maxAmount: number
  minAmount: number
  minBuyAmount: number
  maxBuyAmount: number
  addressRegex: string
  testnetAddressRegex: string
  supportsAddressTag: boolean
  addressTagRegex: null | null
  supportsTestMode: boolean
  supportsLiveMode: boolean
  isSuspended: boolean
  isSupportedInUS: boolean
  notAllowedUSStates: string[]
  notAllowedCountries: string[]
  isSellSupported: boolean
  confirmationsRequired: number
  minSellAmount: number
  maxSellAmount: number
}

export type MoonPayTransaction = {
  id: string
  createdAt: string
  updatedAt: string
  baseCurrencyAmount: number
  quoteCurrencyAmount: number
  feeAmount: number
  extraFeeAmount: number
  networkFeeAmount: number
  areFeesIncluded: boolean
  status: MoonPayTransactionStatus
  failureReason: string | null
  walletAddress: string
  walletAddressTag: string | null
  cryptoTransactionId: string | null
  returnUrl: string
  redirectUrl: string | null
  widgetRedirectUrl: string
  baseCurrencyId: string
  currencyId: string
  customerId: string
  cardId: string
  bankAccountId: string | null
  bankDepositInformation: object | null
  bankTransferReference: string | null
  eurRate: number
  usdRate: number
  gbpRate: number
  externalTransactionId: string
  paymentMethod:
    | 'credit_debit_card'
    | 'sepa_bank_transfer'
    | 'sepa_open_banking_payment'
    | 'gbp_bank_transfer'
    | 'gbp_open_banking_payment'
    | 'ach_bank_transfer'
    | 'pix_instant_payment'
    | 'mobile_wallet'
  baseCurrency: BaseCurrency
  currency: Currency
  externalCustomerId: string
  country: string
  stages: Stage[]
}
