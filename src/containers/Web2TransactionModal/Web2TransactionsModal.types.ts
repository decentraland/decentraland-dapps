import { Wallet } from '../../modules/wallet'

export type Web2TransactionModalProps = {
  isMagicAutoSignEnabled: boolean
  wallet: Wallet | null
}

export type MapStateProps = Pick<Web2TransactionModalProps, 'wallet' | 'isMagicAutoSignEnabled'>
