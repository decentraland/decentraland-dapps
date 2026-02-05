import React, { useEffect, useState } from 'react'
import { isAddress } from '@ethersproject/address'
import { isENSAddress, resolveENSname } from './utils'
import { AddressError, Props } from './AddressProvider.types'

const AddressProvider = (props: Props) => {
  const { children, input, chainId } = props
  const isENS = input && isENSAddress(input)
  const [address, setAddress] = useState(input && !isENS ? input : null)
  const [isLoading, setIsLoading] = useState(!!isENS)
  const [error, setError] = useState<AddressError>()

  useEffect(() => {
    if (address && !isAddress(address) && !isENS) {
      setError(AddressError.INVALID)
    }
  }, [address, isENS])

  // Resolves ENS name if needed
  useEffect(() => {
    let cancel = false
    const resolveAddress = async () => {
      if (input && isENS) {
        setIsLoading(true)
        const resolvedAddress = await resolveENSname(input, chainId)
        setIsLoading(false)
        if (cancel) return
        if (!resolvedAddress) {
          setError(AddressError.ENS_NOT_RESOLVED)
          return
        }
        setAddress(resolvedAddress)
      }
    }
    resolveAddress()
    return () => {
      cancel = true
    }
  }, [isENS, input])

  return <>{children({ address, ens: isENS ? input : null, isLoading, error })}</>
}

export default React.memo(AddressProvider)
