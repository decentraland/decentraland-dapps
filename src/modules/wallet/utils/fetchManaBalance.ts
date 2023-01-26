import { ethers } from 'ethers';
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
    const mana = new ethers.Contract(
      contract.address,
      contract.abi,
      new ethers.providers.Web3Provider(provider)
    );
    const balance = await mana.balanceOf(address);
    return parseFloat(ethers.utils.formatEther(balance));
  } catch (error) {
    return 0;
  }
}
