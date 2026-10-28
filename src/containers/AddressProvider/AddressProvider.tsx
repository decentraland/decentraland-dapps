import React, { useEffect, useState } from 'react'
import { isAddress } from '@ethersproject/address'
import { normalizeENSName } from '../../lib/ens'
import { isENSAddress, resolveENSname } from './utils'
import { AddressError, AddressProviderResult, Props } from './AddressProvider.types'

const AddressProvider = (props: Props) => {
  const { children, input, chainId } = props
  const trimmedInput = (input ?? '').trim()
  const isENS = !!trimmedInput && isENSAddress(trimmedInput)
  const ensName = isENS ? normalizeENSName(trimmedInput) : null
  const initial: AddressProviderResult = {
    address: !isENS && isAddress(trimmedInput) ? trimmedInput : null,
    ens: ensName,
    isLoading: isENS,
    error: !isENS && trimmedInput && !isAddress(trimmedInput) ? AddressError.INVALID : undefined
  }
  const [resolved, setResolved] = useState<{ input: string; chainId: Props['chainId']; result: AddressProviderResult }>()

  useEffect(() => {
    let cancel = false
    // Clear even for direct addresses so revisiting an ENS input starts a fresh lookup.
    setResolved(undefined)
    if (!ensName) return
    const resolve = async () => {
      try {
        const address = await resolveENSname(ensName, chainId)
        if (!cancel) {
          setResolved({
            input,
            chainId,
            result: { address, ens: ensName, isLoading: false, error: address ? undefined : AddressError.ENS_NOT_RESOLVED }
          })
        }
      } catch (error) {
        if (!cancel) {
          console.error('Failed to resolve ENS account address', error)
          setResolved({ input, chainId, result: { address: null, ens: ensName, isLoading: false, error: AddressError.ENS_NOT_RESOLVED } })
        }
      }
    }
    void resolve()
    return () => {
      cancel = true
    }
  }, [ensName, input, chainId])

  const result = resolved && resolved.input === input && resolved.chainId === chainId ? resolved.result : initial
  return <>{children(result)}</>
}

export default React.memo(AddressProvider)
