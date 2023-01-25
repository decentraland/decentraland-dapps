import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import React from 'react'

export enum AddressError {
  INVALID = 'invalid_address',
  ENS_NOT_RESOLVED = 'ens_not_resolved'
}

export type AddressProviderResult = {
  address: string | null
  ens: string | null
  isLoading: boolean
  error?: AddressError
}

export type Props = {
  input: string
  children: (result: AddressProviderResult) => React.ReactNode | null
  chainId: ChainId
}

export type MapStateProps = Pick<Props, 'chainId'>
