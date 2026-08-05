import { TypedDataDomain, ethers } from 'ethers'
import { ChainId, Network, TradeAssetType } from '@dcl/schemas'
import {
  CollectionItemTradeAsset,
  ERC20TradeAsset,
  ERC721TradeAsset,
  Trade,
  USDPeggedManaTradeAsset,
  TradeAsset,
  TradeCreation,
  TradeType
} from '@dcl/schemas/dist/dapps/trade'
import * as ethUtils from './eth'
import { ContractData, ContractName, getContract } from 'decentraland-transactions'
import { fromMillisecondsToSeconds } from '../lib/time'
import { OFFCHAIN_MARKETPLACE_TYPES, getTradeSignature, getOnChainTrade, getValueForTradeAsset } from './trades'

jest.mock('./eth', () => {
  const module = jest.requireActual('./eth')
  return {
    ...module,
    getSigner: jest.fn(() => {
      const wallet = ethers.Wallet.createRandom()
      wallet.connect(ethers.providers.getDefaultProvider())
      return Promise.resolve(wallet)
    })
  } as unknown
})

describe('when getting the value for a trade asset', () => {
  let asset: TradeAsset

  describe('and the asset is an ERC20', () => {
    beforeEach(() => {
      asset = {
        assetType: TradeAssetType.ERC20,
        amount: '100'
      } as ERC20TradeAsset
    })

    it('should return the amount', () => {
      expect(getValueForTradeAsset(asset)).toBe((asset as ERC20TradeAsset).amount)
    })
  })

  describe('and the asset is an ERC721', () => {
    beforeEach(() => {
      asset = {
        assetType: TradeAssetType.ERC721,
        tokenId: 'token-id'
      } as ERC721TradeAsset
    })

    it('should return the token id', () => {
      expect(getValueForTradeAsset(asset)).toBe((asset as ERC721TradeAsset).tokenId)
    })
  })

  describe('and the asset is a COLLECTION ITEM', () => {
    beforeEach(() => {
      asset = {
        assetType: TradeAssetType.COLLECTION_ITEM,
        itemId: 'item-id'
      } as CollectionItemTradeAsset
    })

    it('should return the item id', () => {
      expect(getValueForTradeAsset(asset)).toBe((asset as CollectionItemTradeAsset).itemId)
    })
  })

  /**
   * A USD-pegged amount is an amount like any other here. It is denominated in USD wei rather than MANA wei,
   * but the conversion happens in the contract at settlement — this function only has to reproduce the value
   * the seller signed.
   */
  describe('and the asset is USD-PEGGED MANA', () => {
    beforeEach(() => {
      asset = {
        assetType: TradeAssetType.USD_PEGGED_MANA,
        contractAddress: '0xmana',
        amount: '500000000000000000',
        extra: ''
      } as USDPeggedManaTradeAsset
    })

    it('should return the amount, not an empty value', () => {
      expect(getValueForTradeAsset(asset)).toBe((asset as USDPeggedManaTradeAsset).amount)
    })
  })
})

/**
 * THE REGRESSION THAT MATTERED, AND WHY IT IS ASSERTED HERE.
 *
 * `getOnChainTrade` rebuilds the trade struct that `TradeService.accept` and `TradeService.cancel` hand to the
 * contract. With no case for `USD_PEGGED_MANA`, the received value came back as `''`, so a USD-pegged listing
 * could be neither bought nor cancelled by ANY consumer of this package — it surfaced in production as
 * `invalid BigNumber string (argument="value", value="")` when a creator tried to take their own listing down.
 *
 * Asserted against the literal amount rather than through `getValueForTradeAsset`: routing the expectation
 * through the same function under test is exactly why a green suite did not catch this.
 */
describe('when rebuilding a USD-pegged trade for the contract', () => {
  it('should preserve the amount so the struct still matches the seller signature', () => {
    const trade = {
      signer: '0xsigner',
      signature: '0xsignature',
      type: TradeType.PUBLIC_NFT_ORDER,
      network: Network.MATIC,
      chainId: ChainId.MATIC_AMOY,
      checks: {
        expiration: Date.now() + 100000000,
        effective: Date.now(),
        uses: 1,
        salt: '0x',
        allowedRoot: '0x',
        contractSignatureIndex: 0,
        externalChecks: [],
        signerSignatureIndex: 0
      },
      sent: [{ assetType: TradeAssetType.ERC721, contractAddress: '0xcollection', tokenId: '1', extra: '0x' }],
      received: [
        {
          assetType: TradeAssetType.USD_PEGGED_MANA,
          contractAddress: '0xmana',
          amount: '500000000000000000',
          extra: '0x',
          beneficiary: '0xseller'
        }
      ]
    } as unknown as Trade

    const onChainTrade = getOnChainTrade(trade, '0xbuyer')

    expect(onChainTrade.received[0].value).toBe('500000000000000000')
  })
})

describe('when getting the trade signature', () => {
  let trade: Omit<TradeCreation, 'signature'>

  describe('when the contract does not exist for that chainId', () => {
    beforeEach(() => {
      trade = {
        chainId: ChainId.ARBITRUM_MAINNET
      } as Omit<TradeCreation, 'signature'>
    })

    it.skip('should throw an error', async () => {
      await expect(getTradeSignature(trade)).rejects.toThrowError(
        'Could not get a valid contract for OffChainMarketplace using chain 42161'
      )
    })
  })

  describe('when the contract exists for that chainId', () => {
    let offchainMarketplaceContract: ContractData
    let signerAddress: string
    let signer: ethers.Wallet
    let values: Record<string, any>
    let domain: TypedDataDomain

    beforeEach(async () => {
      signer = ethers.Wallet.createRandom().connect(ethers.providers.getDefaultProvider())
      jest.spyOn(ethUtils, 'getSigner').mockImplementation(() => Promise.resolve(signer))
      signerAddress = (await signer.getAddress()).toLowerCase()
      offchainMarketplaceContract = getContract(ContractName.OffChainMarketplaceV2, ChainId.ETHEREUM_SEPOLIA)

      trade = {
        signer: signerAddress,
        type: TradeType.BID,
        network: Network.ETHEREUM,
        chainId: ChainId.ETHEREUM_SEPOLIA,
        checks: {
          expiration: Date.now() + 100000000000,
          effective: Date.now(),
          uses: 1,
          salt: '0x',
          allowedRoot: '0x',
          contractSignatureIndex: 0,
          externalChecks: [],
          signerSignatureIndex: 0
        },
        sent: [
          {
            assetType: TradeAssetType.ERC20,
            contractAddress: offchainMarketplaceContract.address,
            amount: '2',
            extra: ''
          }
        ],
        received: [
          {
            assetType: TradeAssetType.ERC721,
            contractAddress: offchainMarketplaceContract.address,
            tokenId: '1',
            extra: '',
            beneficiary: signerAddress
          }
        ]
      }

      const SALT = ethers.utils.hexZeroPad(ethers.utils.hexlify(trade.chainId), 32)
      offchainMarketplaceContract = getContract(ContractName.OffChainMarketplaceV2, trade.chainId)
      domain = {
        name: offchainMarketplaceContract.name,
        version: offchainMarketplaceContract.version,
        verifyingContract: offchainMarketplaceContract.address,
        salt: SALT
      }

      values = {
        checks: {
          uses: trade.checks.uses,
          expiration: fromMillisecondsToSeconds(trade.checks.expiration),
          effective: fromMillisecondsToSeconds(trade.checks.effective),
          salt: ethers.utils.hexZeroPad(trade.checks.salt, 32),
          contractSignatureIndex: trade.checks.contractSignatureIndex,
          signerSignatureIndex: trade.checks.signerSignatureIndex,
          allowedRoot: ethers.utils.hexZeroPad(trade.checks.allowedRoot, 32),
          externalChecks: trade.checks.externalChecks?.map(externalCheck => ({
            contractAddress: externalCheck.contractAddress,
            selector: externalCheck.selector,
            value: '0x',
            required: externalCheck.required
          }))
        },
        sent: trade.sent.map(asset => ({
          assetType: asset.assetType,
          contractAddress: asset.contractAddress,
          value: getValueForTradeAsset(asset),
          extra: '0x'
        })),
        received: trade.received.map(asset => ({
          assetType: asset.assetType,
          contractAddress: asset.contractAddress,
          value: getValueForTradeAsset(asset),
          extra: '0x',
          beneficiary: asset.beneficiary
        }))
      }
    })

    it('should return the signature', async () => {
      expect(await getTradeSignature(trade)).toBe(await signer._signTypedData(domain, OFFCHAIN_MARKETPLACE_TYPES, values))
    })
  })
})

describe('when getting the trade to accept', () => {
  let trade: Trade
  let beneficiaryAddress: string

  beforeEach(() => {
    trade = {
      id: 'an-id',
      createdAt: Date.now(),
      signature: '123123123',
      signer: '0x123',
      type: TradeType.BID,
      network: Network.ETHEREUM,
      chainId: ChainId.ETHEREUM_SEPOLIA,
      checks: {
        expiration: Date.now() + 100000000000,
        effective: Date.now(),
        uses: 1,
        salt: '0x',
        allowedRoot: '0x',
        contractSignatureIndex: 0,
        externalChecks: [],
        signerSignatureIndex: 0
      },
      sent: [
        {
          assetType: TradeAssetType.ERC20,
          contractAddress: '0x123',
          amount: '2',
          extra: ''
        }
      ],
      received: [
        {
          assetType: TradeAssetType.ERC721,
          contractAddress: '0x123',
          tokenId: '1',
          extra: '',
          beneficiary: '0x123123'
        }
      ]
    }

    beneficiaryAddress = '0x123123'
  })

  it('should return the trade with the correct structure', () => {
    expect(getOnChainTrade(trade, beneficiaryAddress)).toEqual({
      signer: trade.signer,
      signature: trade.signature,
      checks: {
        expiration: fromMillisecondsToSeconds(trade.checks.expiration),
        effective: fromMillisecondsToSeconds(trade.checks.effective),
        uses: trade.checks.uses,
        salt: ethers.utils.hexZeroPad(trade.checks.salt, 32),
        allowedRoot: ethers.utils.hexZeroPad(trade.checks.allowedRoot, 32),
        allowedProof: [],
        contractSignatureIndex: trade.checks.contractSignatureIndex,
        signerSignatureIndex: trade.checks.signerSignatureIndex,
        externalChecks: trade.checks.externalChecks
      },
      sent: trade.sent.map(asset => ({
        assetType: asset.assetType,
        contractAddress: asset.contractAddress,
        value: getValueForTradeAsset(asset),
        extra: '0x',
        beneficiary: beneficiaryAddress
      })),
      received: trade.received.map(asset => ({
        assetType: asset.assetType,
        contractAddress: asset.contractAddress,
        value: getValueForTradeAsset(asset),
        extra: '0x',
        beneficiary: asset.beneficiary
      }))
    })
  })
})
