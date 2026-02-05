import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { ContractName, getContract } from 'decentraland-transactions'
import { getNetworkProvider } from '../../../lib/eth'

export async function fetchManaBalance(chainId: ChainId, address: string) {
  try {
    const provider = await getNetworkProvider(chainId)
    const contract = getContract(ContractName.MANAToken, chainId)
    const mana = new Contract(contract.address, contract.abi, new Web3Provider(provider))
    const balance = await mana.balanceOf(address)
    return parseFloat(formatEther(balance))
  } catch {
    return 0
  }
}
