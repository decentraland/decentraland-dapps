import { ContractData, sendMetaTransaction } from 'decentraland-transactions'
import { providers } from 'ethers'
import { getConnectedProvider, getNetworkProvider } from '../../lib/eth'
import {
  mockedContract,
  buildMockedNetworkProvider
} from '../../tests/transactions'
import { getTransactionsApiUrl, sendTransaction } from './utils'

jest.mock('../../lib/eth')
jest.mock('decentraland-transactions')
const mockedGetConnectedProvider: jest.Mock<typeof getConnectedProvider> = getConnectedProvider as any
const mockedGetNetworkProvider: jest.Mock<typeof getNetworkProvider> = getNetworkProvider as any
const mockedSendMetaTransaction: jest.Mock<typeof sendMetaTransaction> = sendMetaTransaction as any

type MockedProvider = {
  request: jest.Mock
}

let contract: ContractData

describe('when sending a transaction', () => {
  let error: Error
  const transactionHash =
    '0xc9dd675b8949ce5d18b6cb4c9df888bb4c37ca02bbe54eb42d2b42514a0967c5'

  beforeEach(() => {
    contract = { ...mockedContract }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("and the connected provided couldn't be retrieved", () => {
    beforeEach(() => {
      error = new Error('Could not get provider')
      mockedGetConnectedProvider.mockRejectedValueOnce(error as never)
    })

    it('should throw an error signaling that the provider is not connected', () => {
      return expect(
        sendTransaction(contract, 'totalSupply')
      ).rejects.toThrowError(error.message)
    })
  })

  describe("and the current chain id couldn't be retrieved", () => {
    beforeEach(() => {
      error = new Error('Could not get chain id')
      mockedGetConnectedProvider.mockResolvedValueOnce({
        request: jest.fn().mockRejectedValueOnce(error)
      } as never)
    })

    it('should throw an error signaling that it was not able to get the chain id', () => {
      return expect(
        sendTransaction(contract, 'totalSupply')
      ).rejects.toThrowError(error.message)
    })
  })

  describe("and the target network provided couldn't be retrieved", () => {
    beforeEach(() => {
      error = new Error('Could not get the network provider')
      const connectedNetworkProvider = buildMockedNetworkProvider()
      mockedGetConnectedProvider.mockResolvedValueOnce(
        connectedNetworkProvider as never
      )
      mockedGetNetworkProvider.mockRejectedValueOnce(error as never)
    })

    it('should throw an error signaling that it was not able to get the network provider', () => {
      return expect(
        sendTransaction(contract, 'totalSupply')
      ).rejects.toThrowError(error.message)
    })
  })

  describe("and the current chain id is the same as the contract's chain id", () => {
    describe('and the transaction fails to be sent', () => {
      beforeEach(() => {
        error = new Error('Transaction failed to be sent')
        const networkProvider = {
          request: ({ method }: { method: string }) => {
            switch (method) {
              case 'eth_chainId':
                return Promise.resolve('0x13881')
              case 'eth_accounts':
                return Promise.resolve([
                  '0x7309F0134f3e51E8CBE29dD86068e0F264F6c946'
                ])
              case 'eth_estimateGas':
                return Promise.resolve('0x5208')
              case 'eth_sendTransaction':
                return Promise.reject(error)
              default:
                throw new Error(`Unexpected method ${method}`)
            }
          }
        }

        const connectedNetworkProvider = buildMockedNetworkProvider({
          ethChainId: Promise.resolve('0x13881')
        })

        mockedGetNetworkProvider.mockResolvedValue(networkProvider as never)
        mockedGetConnectedProvider.mockResolvedValue(
          connectedNetworkProvider as never
        )
      })

      it('should throw an error signaling that it was not able to send the transaction', () => {
        return expect(sendTransaction(contract, 'totalSupply')).rejects.toThrow(
          error.message
        )
      })
    })

    describe('and the transaction is sent successfully', () => {
      let networkProvider: MockedProvider

      beforeEach(() => {
        networkProvider = buildMockedNetworkProvider({
          ethSendTransaction: Promise.resolve(transactionHash)
        })

        const connectedNetworkProvider = buildMockedNetworkProvider({
          ethChainId: Promise.resolve('0x13881')
        })

        mockedGetNetworkProvider.mockResolvedValue(networkProvider as never)
        mockedGetConnectedProvider.mockResolvedValue(
          connectedNetworkProvider as never
        )
      })

      it('should resolve with the transaction hash', () => {
        return expect(
          sendTransaction(contract, 'totalSupply')
        ).resolves.toEqual(transactionHash)
      })

      it('should have sent the transaction with the populated data', async () => {
        await sendTransaction(contract, 'totalSupply')
        expect(networkProvider.request).toHaveBeenCalledWith({
          method: 'eth_sendTransaction',
          params: [
            {
              gas: '0x5208',
              from: '0x7309f0134f3e51e8cbe29dd86068e0f264f6c946',
              to: mockedContract.address,
              data: '0x18160ddd'
            }
          ]
        })
      })
    })
  })

  describe("and the current chain id is not the same as the contract's chain id", () => {
    describe('and the meta transaction fails to be sent', () => {
      beforeEach(() => {
        error = new Error('Meta transaction failed to be sent')
        const networkProvider = buildMockedNetworkProvider()
        const connectedNetworkProvider = buildMockedNetworkProvider({
          ethChainId: Promise.resolve('0x89')
        })

        mockedGetNetworkProvider.mockResolvedValue(networkProvider as never)
        mockedGetConnectedProvider.mockResolvedValue(
          connectedNetworkProvider as never
        )
        mockedSendMetaTransaction.mockRejectedValueOnce(error as never)
      })

      it('should throw an error signaling the failure of the meta transaction', () => {
        return expect(sendTransaction(contract, 'totalSupply')).rejects.toThrow(
          error.message
        )
      })
    })

    describe('and the meta transaction is sent successfully', () => {
      let networkProvider: MockedProvider
      let connectedNetworkProvider: MockedProvider

      beforeEach(() => {
        networkProvider = buildMockedNetworkProvider()
        connectedNetworkProvider = buildMockedNetworkProvider({
          ethChainId: Promise.resolve('0x89')
        })

        mockedGetNetworkProvider.mockResolvedValue(networkProvider as never)
        mockedGetConnectedProvider.mockResolvedValue(
          connectedNetworkProvider as never
        )
        mockedSendMetaTransaction.mockResolvedValueOnce(
          transactionHash as never
        )
      })

      it('should resolve with the transaction hash', () => {
        return expect(
          sendTransaction(contract, 'totalSupply')
        ).resolves.toEqual(transactionHash)
      })

      it('should have sent the meta transaction with all the required parameters', async () => {
        await sendTransaction(contract, 'totalSupply')
        expect(sendMetaTransaction).toHaveBeenCalledWith(
          connectedNetworkProvider,
          expect.any(providers.Web3Provider),
          '0x18160ddd',
          mockedContract,
          {
            serverURL: getTransactionsApiUrl()
          }
        )
      })
    })
  })
})
