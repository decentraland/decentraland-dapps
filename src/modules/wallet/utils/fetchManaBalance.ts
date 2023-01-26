import { formatEther } from '@ethersproject/units';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import {
  ContractName,
  getContract
} from 'decentraland-transactions';
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id';
import { getNetworkProvider } from '../../../lib/eth';


export async function fetchManaBalance(chainId: ChainId, address: string) {
  try {
    const provider = await getNetworkProvider(chainId);
    const contract = getContract(ContractName.MANAToken, chainId);
    const mana = new Contract(
      contract.address,
      contract.abi,
      new Web3Provider(provider)
    );
    const balance = await mana.balanceOf(address);
    return parseFloat(formatEther(balance));
  } catch (error) {
    return 0;
  }
}
