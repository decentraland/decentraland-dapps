import { act, render, screen, waitFor } from '@testing-library/react'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import AddressProvider from './AddressProvider'
import { AddressProviderResult } from './AddressProvider.types'
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
    let error: Error
    let logError: jest.SpyInstance

    beforeEach(async () => {
      error = new Error('RPC unavailable')
      logError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
      resolveMock.mockRejectedValueOnce(error)
      await act(async () => {
        view.rerender(
          <AddressProvider input="bob.eth" chainId={ChainId.ETHEREUM_MAINNET}>
            {result => <output>{JSON.stringify(result)}</output>}
          </AddressProvider>
        )
      })
    })

    afterEach(() => {
      logError.mockRestore()
    })

    it('should finish loading and report the failure', async () => {
      await waitFor(() => expect(screen.getByRole('status').textContent).toContain('"isLoading":false,"error":"ens_not_resolved"'))
    })

    it('should log the operational failure for diagnosis', () => {
      expect(logError).toHaveBeenCalledWith('Failed to resolve ENS account address', error)
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

describe('when an account input contains surrounding whitespace', () => {
  let recipient: string

  beforeEach(() => {
    recipient = '0x000000000000000000000000000000000000000b'
    resolveMock.mockResolvedValue(recipient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return a trimmed direct address without resolving ENS', () => {
    render(
      <AddressProvider input={`  ${recipient}  `} chainId={ChainId.ETHEREUM_MAINNET}>
        {result => <output>{JSON.stringify(result)}</output>}
      </AddressProvider>
    )
    expect(JSON.parse(screen.getByRole('status').textContent!)).toEqual({ address: recipient, ens: null, isLoading: false })
    expect(resolveMock).not.toHaveBeenCalled()
  })

  it('should resolve and expose the same canonical Unicode ENS name', async () => {
    render(
      <AddressProvider input="  RAFFY🚴‍♂️.ETH  " chainId={ChainId.ETHEREUM_MAINNET}>
        {result => <output>{JSON.stringify(result)}</output>}
      </AddressProvider>
    )
    await waitFor(() => expect(resolveMock).toHaveBeenCalledWith('raffy🚴‍♂.eth', ChainId.ETHEREUM_MAINNET))
    await waitFor(() =>
      expect(JSON.parse(screen.getByRole('status').textContent!)).toEqual({
        address: recipient,
        ens: 'raffy🚴‍♂.eth',
        isLoading: false
      })
    )
  })
})

describe('when the ENS account lookup fails because of unsupported chain configuration', () => {
  let error: Error
  let logError: jest.SpyInstance

  beforeEach(() => {
    error = new Error('Unsupported ENS chain: 5')
    logError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    resolveMock.mockRejectedValueOnce(error)
    render(
      <AddressProvider input="alice.eth" chainId={5 as ChainId}>
        {result => <output>{JSON.stringify(result)}</output>}
      </AddressProvider>
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.resetAllMocks()
  })

  it('should log the diagnostic and expose the existing resolution error state', async () => {
    await waitFor(() => expect(logError).toHaveBeenCalledWith('Failed to resolve ENS account address', error))
    expect(JSON.parse(screen.getByRole('status').textContent!)).toEqual({
      address: null,
      ens: 'alice.eth',
      isLoading: false,
      error: 'ens_not_resolved'
    })
  })
})

describe('when revisiting an ENS account after entering a direct address', () => {
  let view: ReturnType<typeof render>
  let oldRecipient: string
  let directRecipient: string
  let renderedResults: AddressProviderResult[]
  let renderResult: (result: AddressProviderResult) => JSX.Element

  beforeEach(async () => {
    renderedResults = []
    renderResult = result => {
      renderedResults.push(result)
      return <output>{JSON.stringify(result)}</output>
    }
    oldRecipient = '0x000000000000000000000000000000000000000a'
    directRecipient = '0x000000000000000000000000000000000000000b'
    resolveMock.mockResolvedValueOnce(oldRecipient).mockReturnValueOnce(new Promise(() => undefined))
    view = render(
      <AddressProvider input="alice.eth" chainId={ChainId.ETHEREUM_MAINNET}>
        {renderResult}
      </AddressProvider>
    )
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain(oldRecipient))
    view.rerender(
      <AddressProvider input={directRecipient} chainId={ChainId.ETHEREUM_MAINNET}>
        {renderResult}
      </AddressProvider>
    )
    // Observe every render during the revisit, including the one before effects run.
    renderedResults = []
    view.rerender(
      <AddressProvider input="alice.eth" chainId={ChainId.ETHEREUM_MAINNET}>
        {renderResult}
      </AddressProvider>
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should wait for a fresh lookup rather than reusing the earlier recipient', () => {
    expect(JSON.parse(screen.getByRole('status').textContent!)).toEqual({ address: null, ens: 'alice.eth', isLoading: true })
    expect(resolveMock).toHaveBeenCalledTimes(2)
    expect(renderedResults.length).toBeGreaterThan(0)
    expect(renderedResults.every(result => result.address === null && result.ens === 'alice.eth' && result.isLoading)).toBe(true)
  })
})

describe.each([undefined, null])('when an untyped caller supplies %s as the account input', input => {
  beforeEach(() => {
    render(
      <AddressProvider input={input as unknown as string} chainId={ChainId.ETHEREUM_MAINNET}>
        {result => <output>{JSON.stringify(result)}</output>}
      </AddressProvider>
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should preserve the empty-input behavior without starting a lookup', () => {
    expect(screen.getByRole('status').textContent).toBe('{"address":null,"ens":null,"isLoading":false}')
    expect(resolveMock).not.toHaveBeenCalled()
  })
})
