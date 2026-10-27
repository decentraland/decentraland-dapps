import React, { useEffect, useState } from 'react'
import { isAddress } from '@ethersproject/address'
import { isENSAddress, resolveENSname } from './utils'
import { AddressError, AddressProviderResult, Props } from './AddressProvider.types'

const AddressProvider = (props: Props) => {
  const { children, input, chainId } = props
  const isENS = !!input && isENSAddress(input)
  const initial: AddressProviderResult = {
    address: !isENS && isAddress(input) ? input : null,
    ens: isENS ? input : null,
    isLoading: isENS,
    error: !isENS && input && !isAddress(input) ? AddressError.INVALID : undefined
  }
  const [resolved, setResolved] = useState<{ input: string; chainId: Props['chainId']; result: AddressProviderResult }>()

  useEffect(() => {
    let cancel = false
    if (!isENS) return
    setResolved(undefined)
    const resolve = async () => {
      try {
        const address = await resolveENSname(input, chainId)
        if (!cancel) {
          setResolved({
            input,
            chainId,
            result: { address, ens: input, isLoading: false, error: address ? undefined : AddressError.ENS_NOT_RESOLVED }
          })
        }
      } catch {
        if (!cancel) {
          setResolved({ input, chainId, result: { address: null, ens: input, isLoading: false, error: AddressError.ENS_NOT_RESOLVED } })
        }
      }
    }
    void resolve()
    return () => {
      cancel = true
    }
  }, [isENS, input, chainId])

  const result = resolved?.input === input && resolved.chainId === chainId ? resolved.result : initial
  return <>{children(result)}</>
}

export default React.memo(AddressProvider)
