import type { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { hexZeroPad, hexlify } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'
import type { JsonRpcSigner } from '@ethersproject/providers'
import { ChainId, OnChainTrade, OnChainTradeAsset, Trade, TradeAsset, TradeAssetType, TradeCreation } from '@dcl/schemas'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { getNetworkProvider, getSigner } from './eth'
import { fromMillisecondsToSeconds } from './time'

export const OFFCHAIN_MARKETPLACE_TYPES: Record<string, TypedDataField[]> = {
  Trade: [
    { name: 'checks', type: 'Checks' },
    { name: 'sent', type: 'AssetWithoutBeneficiary[]' },
    { name: 'received', type: 'Asset[]' }
  ],
  Asset: [
    { name: 'assetType', type: 'uint256' },
    { name: 'contractAddress', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'extra', type: 'bytes' },
    { name: 'beneficiary', type: 'address' }
  ],
  AssetWithoutBeneficiary: [
    { name: 'assetType', type: 'uint256' },
    { name: 'contractAddress', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'extra', type: 'bytes' }
  ],
  Checks: [
    { name: 'uses', type: 'uint256' },
    { name: 'expiration', type: 'uint256' },
    { name: 'effective', type: 'uint256' },
    { name: 'salt', type: 'bytes32' },
    { name: 'contractSignatureIndex', type: 'uint256' },
    { name: 'signerSignatureIndex', type: 'uint256' },
    { name: 'allowedRoot', type: 'bytes32' },
    { name: 'externalChecks', type: 'ExternalCheck[]' }
  ],
  ExternalCheck: [
    { name: 'contractAddress', type: 'address' },
    { name: 'selector', type: 'bytes4' },
    { name: 'value', type: 'bytes' },
    { name: 'required', type: 'bool' }
  ]
}

export async function getOffChainMarketplaceContract(chainId: ChainId) {
  const provider = await getNetworkProvider(chainId)
  if (!provider) {
    throw new Error('Could not get connected provider')
  }
  const { address, abi } = getContract(ContractName.OffChainMarketplaceV2, chainId)
  const instance = new Contract(address, abi, new Web3Provider(provider))
  return instance
}

export function getValueForTradeAsset(asset: TradeAsset): string {
  switch (asset.assetType) {
    case TradeAssetType.ERC721:
      return asset.tokenId
    case TradeAssetType.COLLECTION_ITEM:
      return asset.itemId
    case TradeAssetType.ERC20:
      return asset.amount
    case TradeAssetType.USD_PEGGED_MANA:
      // The amount VERBATIM, exactly as for ERC20. It is denominated in USD wei rather than MANA wei, but
      // converting it is the contract's job at settlement — what goes in here has to reproduce the value the
      // SELLER signed, or the rebuilt trade hashes differently and the signature check rejects it on chain.
      //
      // Falling through to `default` returned '' for these, and every consumer of this package inherited it:
      // `generateTradeValues` feeds this into the EIP-712 struct and `getOnChainTrade` rebuilds that struct for
      // `accept()` and `cancelSignature()`. So a USD-pegged listing could be neither bought NOR cancelled —
      // observed in production as `invalid BigNumber string (argument="value", value="")` when a creator tried
      // to take their own listing down from the Builder.
      return asset.amount
    default: {
      // Compile-time exhaustiveness: `USDPeggedManaTradeAsset` has been a member of the `TradeAsset` union all
      // along, so the missing case above was a hole in a closed union that `default` silently absorbed. A new
      // member now becomes a type error here instead of another empty value that only surfaces on chain.
      //
      // Runtime behaviour is unchanged on purpose: this also receives API data, so a value outside the union
      // must degrade rather than throw.
      const unhandled: never = asset
      console.error('Invalid asset type:', unhandled)
      return ''
    }
  }
}

export function generateTradeValues(trade: Omit<TradeCreation, 'signature'>) {
  return {
    checks: {
      uses: trade.checks.uses,
      expiration: fromMillisecondsToSeconds(trade.checks.expiration),
      effective: fromMillisecondsToSeconds(trade.checks.effective),
      salt: hexZeroPad(trade.checks.salt, 32),
      contractSignatureIndex: trade.checks.contractSignatureIndex,
      signerSignatureIndex: trade.checks.signerSignatureIndex,
      allowedRoot: hexZeroPad(trade.checks.allowedRoot, 32),
      externalChecks: trade.checks.externalChecks?.map(externalCheck => ({
        contractAddress: externalCheck.contractAddress,
        selector: externalCheck.selector,
        // '0x' is the default value for value bytes (0 bytes)
        value: externalCheck.value ? externalCheck.value : '0x',
        required: externalCheck.required
      }))
    },
    sent: trade.sent.map(asset => ({
      assetType: asset.assetType,
      contractAddress: asset.contractAddress,
      value: getValueForTradeAsset(asset),
      // '0x' is the default value for value bytes (0 bytes)
      extra: asset.extra ? asset.extra : '0x'
    })),
    received: trade.received.map(asset => ({
      assetType: asset.assetType,
      contractAddress: asset.contractAddress,
      value: getValueForTradeAsset(asset),
      // '0x' is the default value for value bytes (0 bytes)
      extra: asset.extra ? asset.extra : '0x',
      beneficiary: asset.beneficiary
    }))
  }
}

export function getOnChainTrade(trade: Trade, sentBeneficiaryAddress: string): OnChainTrade {
  const tradeValues = generateTradeValues(trade)

  return {
    signer: trade.signer,
    signature: trade.signature,
    ...tradeValues,
    checks: {
      ...tradeValues.checks,
      allowedProof: []
    },
    // set the beneficiary of the sent assets to the address of the logged in user
    sent: tradeValues.sent.map<OnChainTradeAsset>(asset => ({
      ...asset,
      beneficiary: sentBeneficiaryAddress
    }))
  }
}

export async function getTradeSignature(trade: Omit<TradeCreation, 'signature'>) {
  const marketplaceContract: ContractData = getContract(ContractName.OffChainMarketplaceV2, trade.chainId)

  if (!marketplaceContract) {
    throw new Error(`The ${ContractName.OffChainMarketplace} contract doesn't exist on chain ${trade.chainId}`)
  }

  const signer = (await getSigner()) as JsonRpcSigner
  const SALT = hexZeroPad(hexlify(trade.chainId), 32)
  const domain: TypedDataDomain = {
    name: marketplaceContract.name,
    version: marketplaceContract.version,
    salt: SALT,
    verifyingContract: marketplaceContract.address
  }

  const signature = await signer._signTypedData(domain, OFFCHAIN_MARKETPLACE_TYPES, generateTradeValues(trade))
  return signature
}
