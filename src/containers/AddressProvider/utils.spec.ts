import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { resolveAddress } from '../../lib/ens'
import { getENSWeb3Provider } from '../../lib/eth'
import { resolveENSname } from './utils'

jest.mock('../../lib/ens', () => ({ ...jest.requireActual('../../lib/ens'), resolveAddress: jest.fn() }))
jest.mock('../../lib/eth')
const resolveMock = resolveAddress as jest.MockedFunction<typeof resolveAddress>
const providerMock = getENSWeb3Provider as jest.MockedFunction<typeof getENSWeb3Provider>

describe('when resolving an account name', () => {
  beforeEach(() => {
    resolveMock.mockResolvedValueOnce(undefined)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should resolve Polygon accounts on Ethereum mainnet', async () => {
    await resolveENSname('alice.example.com', ChainId.MATIC_MAINNET)
    expect(providerMock).toHaveBeenCalledWith(ChainId.ETHEREUM_MAINNET)
  })

  it('should resolve Amoy accounts on Sepolia', async () => {
    await resolveENSname('alice.eth', ChainId.MATIC_AMOY)
    expect(providerMock).toHaveBeenCalledWith(ChainId.ETHEREUM_SEPOLIA)
  })

  it('should preserve the nullable result expected by the container', async () => {
    await expect(resolveENSname('missing.eth', ChainId.ETHEREUM_MAINNET)).resolves.toBeNull()
  })
})
