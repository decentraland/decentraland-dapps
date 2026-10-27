import { act, render, screen, waitFor } from '@testing-library/react'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import AddressProvider from './AddressProvider'
import { resolveENSname } from './utils'

jest.mock('./utils', () => ({ ...jest.requireActual('./utils'), resolveENSname: jest.fn() }))
const resolveMock = resolveENSname as jest.MockedFunction<typeof resolveENSname>

describe('when resolving an account input', () => {
  let finishFirst: (address: string | null) => void
  let first: Promise<string | null>
  let recipient: string
  let view: ReturnType<typeof render>

  beforeEach(() => {
    recipient = '0x000000000000000000000000000000000000000b'
    first = new Promise(resolve => {
      finishFirst = resolve
    })
    resolveMock.mockReturnValueOnce(first)
    view = render(
      <AddressProvider input="alice.eth" chainId={ChainId.ETHEREUM_MAINNET}>
        {result => <output>{JSON.stringify(result)}</output>}
      </AddressProvider>
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('and the input changes before the lookup completes', () => {
    beforeEach(async () => {
      await act(async () => {
        view.rerender(
          <AddressProvider input={recipient} chainId={ChainId.ETHEREUM_MAINNET}>
            {result => <output>{JSON.stringify(result)}</output>}
          </AddressProvider>
        )
      })
      await act(async () => {
        finishFirst('0x000000000000000000000000000000000000000a')
        await first
      })
    })

    it('should retain the current recipient', () => {
      expect(screen.getByRole('status').textContent).toContain(recipient)
    })

    it('should clear the loading state', () => {
      expect(screen.getByRole('status').textContent).toContain('"isLoading":false')
    })
  })

  describe('and the next lookup fails', () => {
    beforeEach(async () => {
      resolveMock.mockRejectedValueOnce(new Error('RPC unavailable'))
      await act(async () => {
        view.rerender(
          <AddressProvider input="bob.eth" chainId={ChainId.ETHEREUM_MAINNET}>
            {result => <output>{JSON.stringify(result)}</output>}
          </AddressProvider>
        )
      })
    })

    it('should finish loading and report the failure', async () => {
      await waitFor(() => expect(screen.getByRole('status').textContent).toContain('"isLoading":false,"error":"ens_not_resolved"'))
    })
  })

  describe('and the chain changes', () => {
    beforeEach(async () => {
      resolveMock.mockResolvedValueOnce(recipient)
      await act(async () => {
        view.rerender(
          <AddressProvider input="alice.eth" chainId={ChainId.ETHEREUM_SEPOLIA}>
            {result => <output>{JSON.stringify(result)}</output>}
          </AddressProvider>
        )
      })
    })

    it('should resolve using the new chain', async () => {
      await waitFor(() => expect(resolveMock).toHaveBeenLastCalledWith('alice.eth', ChainId.ETHEREUM_SEPOLIA))
    })
  })
})

describe.each(['alice..eth', 'аlice.eth'])('when the account input is invalid: %s', input => {
  beforeEach(() => {
    render(
      <AddressProvider input={input} chainId={ChainId.ETHEREUM_MAINNET}>
        {result => <output>{JSON.stringify(result)}</output>}
      </AddressProvider>
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should report invalid input without attempting resolution', () => {
    expect(screen.getByRole('status').textContent).toContain('"error":"invalid_address"')
    expect(resolveMock).not.toHaveBeenCalled()
  })
})
