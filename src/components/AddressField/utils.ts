import { Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { namehash } from "ethers/lib/utils";
import { ChainId } from "@dcl/schemas";
import { getConnectedProvider } from "../../lib/eth";
import { getAnalytics } from "../../modules/analytics/utils";

function getResolverContract(contractAddress: string, provider: Provider) {
  return new ethers.Contract(
    contractAddress,
    [
      "function addr(bytes32 node) public view virtual override returns (address payable)",
    ],
    provider,
  );
}

export async function resolveName(name: string) {
  const nodehash = namehash(name);
  const connectedProvider = await getConnectedProvider();
  if (!connectedProvider) {
    throw new Error("Couldn't get connected provider to resolve name");
  }

  const provider = new ethers.providers.Web3Provider(connectedProvider);
  const { chainId } = await provider.getNetwork();

  const resolverAddress =
    chainId === ChainId.ETHEREUM_SEPOLIA
      ? "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD"
      : "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41";

  const resolverContract = getResolverContract(resolverAddress, provider);
  const resolvedAddress: string = await resolverContract.addr(nodehash);
  if (resolvedAddress !== ethers.constants.AddressZero) {
    const analytics = getAnalytics();
    if (analytics) {
      analytics.track("Resolve Address from Name", {
        name,
        address: resolvedAddress,
      });
    }

    return resolvedAddress;
  }

  return undefined;
}
