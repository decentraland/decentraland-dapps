import { ProviderWindow } from './WalletProvider.types'

export const getInjectedProvider = () => (window as ProviderWindow).ethereum
