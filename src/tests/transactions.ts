import { ChainId } from '@dcl/schemas'

export const mockedContract = {
  abi: [
    {
      constant: false,
      inputs: [
        {
          name: 'from',
          type: 'address'
        },
        {
          name: 'to',
          type: 'address'
        },
        {
          name: 'value',
          type: 'uint256'
        }
      ],
      name: 'transferFrom',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'approve',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ],
  address: '0x5a467398dfa9d5c663a656423a2d055f538198a4',
  name: 'aContractName',
  version: '1.0',
  chainId: ChainId.MATIC_MUMBAI
}

type buildNetworkProviderOptions = {
  ethChainId?: Promise<string>
  ethAccounts?: Promise<string[]>
  ethEstimateGas?: Promise<string>
  ethSendTransaction?: Promise<string>
  ethBlockNumber?: Promise<string>
  eth_getTransactionByHash?: Promise<string>
}

export function buildMockedNetworkProvider(
  options?: buildNetworkProviderOptions
) {
  const {
    ethChainId,
    ethAccounts,
    ethEstimateGas,
    ethSendTransaction,
    ethBlockNumber,
    eth_getTransactionByHash
  } = options ?? {}

  return {
    request: jest
      .fn()
      .mockImplementation(
        ({ method }: { method: string; params: string[] }) => {
          switch (method) {
            case 'eth_chainId':
              return ethChainId ?? Promise.resolve('0x13881')
            case 'eth_accounts':
              return (
                ethAccounts ??
                Promise.resolve(['0x7309F0134f3e51E8CBE29dD86068e0F264F6c946'])
              )
            case 'eth_estimateGas':
              return ethEstimateGas ?? Promise.resolve('0x5208')
            case 'eth_sendTransaction':
              return (
                ethSendTransaction ??
                Promise.resolve(
                  '0xc9dd675b8949ce5d18b6cb4c9df888bb4c37ca02bbe54eb42d2b42514a0967c5'
                )
              )
            case 'eth_blockNumber':
              return ethBlockNumber ?? Promise.resolve('0x4b7')
            case 'eth_getTransactionByHash':
              return (
                eth_getTransactionByHash ??
                Promise.resolve({
                  blockHash:
                    '0x1d59ff54b1eb26b013ce3cb5fc9dab3705b415a67127a003c3e61eb445bb8df2',
                  blockNumber: '0x4b7',
                  from: '0x7309F0134f3e51E8CBE29dD86068e0F264F6c946',
                  gas: '0x5208',
                  gasPrice: '0x4a817c800',
                  hash:
                    '0xc9dd675b8949ce5d18b6cb4c9df888bb4c37ca02bbe54eb42d2b42514a0967c5',
                  input: '0x68656c6c6f21',
                  nonce: '0x15',
                  to: mockedContract.address,
                  transactionIndex: '0x41',
                  value: '0xf3dbb76162000',
                  v: '0x25',
                  r:
                    '0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea',
                  s:
                    '0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c'
                })
              )
            default:
              throw new Error(`Unsupported method: ${method}`)
          }
        }
      )
  }
}
