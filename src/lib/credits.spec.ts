import { ethers } from "ethers";
import {
  ChainId,
  ERC20TradeAsset,
  Item,
  Network,
  NFT,
  Order,
  Trade,
  TradeAssetType,
  TradeType,
} from "@dcl/schemas";
import {
  ContractData,
  ContractName,
  getContract,
} from "decentraland-transactions";
import { Credit } from "../modules/credits/types";
import {
  CreditsService,
  CreditsData,
  ExternalCallParams,
  CollectionManagerCreateCollectionArgs,
} from "./credits";
import { getOnChainTrade } from "./trades";

// Only mock external dependencies
const mockSendTransaction = jest.fn();
const mockGetOnChainTrade = jest.fn();

// Mock wallet utils
jest.mock("../modules/wallet/utils", () => ({
  sendTransaction: (...args) => mockSendTransaction(...args),
}));

// Mock trades utils

// Extended external call type to match what the actual implementation returns
type ExtendedExternalCall = ExternalCallParams & {
  salt: string;
  expiresAt: number;
};

const creditsService = new CreditsService();

describe("CreditsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock sendTransaction implementation
    mockSendTransaction.mockResolvedValue("0xtransactionHash");

    // Mock getOnChainTrade implementation
    mockGetOnChainTrade.mockReturnValue({
      signer: "0x0000000000000000000000000000000000000123",
      signature:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      checks: {
        uses: 1,
        expiration: 1234567890,
        effective: 1234567890,
        salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
        contractSignatureIndex: 0,
        signerSignatureIndex: 0,
        allowedRoot:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        allowedProof: [],
        externalChecks: [],
      },
      sent: [
        {
          assetType: TradeAssetType.ERC721,
          contractAddress: "0x7ad72b9f944ea9793cf4055d88f81138cc2c63a0",
          value: "1",
          beneficiary: "0x0000000000000000000000000000000000000321",
        },
      ],
      received: [
        {
          assetType: TradeAssetType.ERC20,
          contractAddress: "0x7ad72b9f944ea9793cf4055d88f81138cc2c63a0",
          value: "1000",
          beneficiary: "0x0000000000000000000000000000000000000123",
        },
      ],
    });

    // Mock Date.now
    jest.spyOn(Date, "now").mockReturnValue(1234567890000);
  });

  describe("prepareCreditsData", () => {
    let mockContract: ContractData;
    beforeEach(() => {
      mockContract = {
        name: "CreditsManager",
        address: "0xCreditsManagerAddress",
        abi: [],
        version: "1",
        chainId: ChainId.MATIC_AMOY,
      };
    });
    it("should prepare credits data returning value, expiresAt and salt for each credit, the contract and the creditsSignatures", () => {
      const credits: Credit[] = [
        {
          id: "credit1",
          amount: "100",
          expiresAt: "1234567890",
          signature: "0xsignature1",
          availableAmount: "100",
          contract: getContract(ContractName.CreditsManager, ChainId.MATIC_AMOY)
            .address,
          season: 1,
          timestamp: "1234567890",
          userAddress: "0xuser",
        },
        {
          id: "0xabcdef",
          amount: "200",
          expiresAt: "1234567890",
          signature: "0xsignature2",
          availableAmount: "200",
          contract: getContract(ContractName.CreditsManager, ChainId.MATIC_AMOY)
            .address,
          season: 1,
          timestamp: "1234567890",
          userAddress: "0xuser",
        },
      ];

      const result = creditsService["prepareCreditsData"](
        credits,
        ChainId.MATIC_AMOY,
      );

      // Just check the structure and specific values but not the exact salt transformation
      expect(result.creditsData[0].value).toEqual("100");
      expect(result.creditsData[0].expiresAt).toEqual(1234567890);
      expect(result.creditsData[1].value).toEqual("200");
      expect(result.creditsData[1].expiresAt).toEqual(1234567890);
      expect(result.creditsSignatures).toEqual([
        "0xsignature1",
        "0xsignature2",
      ]);
    });
  });

  describe("prepareExternalCall", () => {
    it("should prepare external call and return target, selector, data, expiresAt and salt", () => {
      const params: Pick<ExternalCallParams, "target" | "selector" | "data"> = {
        target: "0xtarget",
        selector: "0xselector",
        data: "0xdata",
      };

      // @ts-ignore: Accessing private method
      const result = creditsService["prepareExternalCall"](params);

      expect(result).toMatchObject({
        target: "0xtarget",
        selector: "0xselector",
        data: "0xdata",
        expiresAt: 1234567890 + 3600 * 24,
      });

      // Check that salt exists and is a hex string
      expect(result.salt).toBeTruthy();
      expect(result.salt.startsWith("0x")).toBe(true);
    });
  });

  describe("executeUseCredits", () => {
    it("should execute useCredits with parameters expected and return the transaction hash", async () => {
      const contract: ContractData = {
        name: "CreditsManager",
        address: "0xCreditsManagerAddress",
        abi: [],
        version: "1",
        chainId: ChainId.MATIC_AMOY,
      };
      const creditsData: CreditsData[] = [
        { value: "100", expiresAt: 1234567890, salt: "0xsalt1" },
      ];
      const creditsSignatures = ["0xsignature1"];
      const externalCall: ExtendedExternalCall = {
        target: "0xtarget",
        selector: "0xselector",
        data: "0xdata",
        salt: "0xsalt",
        expiresAt: 1234567890,
      };
      const maxCreditedValue = "1000";
      const maxUncreditedValue = "900";

      // @ts-ignore: Accessing private method
      await creditsService["executeUseCredits"](
        contract,
        creditsData,
        creditsSignatures,
        externalCall,
        maxCreditedValue,
        maxUncreditedValue,
      );

      expect(mockSendTransaction).toHaveBeenCalledWith(contract, "useCredits", {
        credits: creditsData,
        creditsSignatures,
        externalCall,
        customExternalCallSignature: "0x",
        maxUncreditedValue,
        maxCreditedValue,
      });
    });
  });

  describe("prepareCreditsCollectionStore", () => {
    let item: Item;
    beforeEach(() => {
      item = {
        id: "item1",
        name: "Item 1",
        itemId: "1",
        contractAddress: "0x74b1b01874724bb6223f863d4899e65cf51aaa9f",
        price: "1000",
        chainId: ChainId.MATIC_AMOY,
      } as unknown as Item;
    });

    it("should prepare credits data for collection store call", () => {
      // Use a valid ethereum address format
      const walletAddress = "0x0000000000000000000000000000000000000123";
      const credits: Credit[] = [
        {
          id: "0x123",
          amount: "100",
          expiresAt: "1234567890",
          signature: "0xsignature1",
          availableAmount: "100",
          contract: getContract(ContractName.CreditsManager, ChainId.MATIC_AMOY)
            .address,
          season: 1,
          timestamp: "1234567890",
          userAddress: "0xuser",
        },
      ];

      const result = creditsService.prepareCreditsCollectionStore(
        item,
        walletAddress,
        credits,
      );

      expect(result).toEqual({
        contract: getContract(ContractName.CreditsManager, ChainId.MATIC_AMOY),
        creditsData: [
          {
            value: "100",
            expiresAt: 1234567890,
            salt: ethers.utils.hexZeroPad(credits[0].id, 32),
          },
        ],
        creditsSignatures: ["0xsignature1"],
        externalCall: {
          target: getContract(ContractName.CollectionStore, ChainId.MATIC_AMOY)
            .address,
          selector: "0xa4fdc78a",
          data: ethers.utils.defaultAbiCoder.encode(
            [
              "tuple(address collection, uint256[] ids, uint256[] prices, address[] beneficiaries)[]",
            ],
            [
              [
                {
                  collection: item.contractAddress,
                  ids: [item.itemId],
                  prices: [item.price],
                  beneficiaries: [walletAddress],
                },
              ],
            ],
          ),
          expiresAt: expect.any(Number),
          salt: expect.any(String),
        },
        maxUncreditedValue: "900",
        maxCreditedValue: "1000",
      });
    });
  });

  describe("useCreditsCollectionStore", () => {
    it("should execute useCredits for collection store", async () => {
      const item = {
        id: "item1",
        name: "Item 1",
        description: "Description",
        itemId: "1",
        contractAddress: "0xitemContract",
        price: "1000",
        chainId: ChainId.MATIC_AMOY,
      } as unknown as Item;

      const walletAddress = "0xuser";
      const credits: Credit[] = [
        {
          id: "credit1",
          amount: "100",
          expiresAt: "1234567890",
          signature: "0xsignature1",
          availableAmount: "100",
          contract: "0xcontract",
          season: 1,
          timestamp: "1234567890",
          userAddress: "0xuser",
        },
      ];

      // Create a spy with the extended type
      const extendedExternalCall: ExtendedExternalCall = {
        target: "0xtarget",
        selector: "0xselector",
        data: "0xdata",
        salt: "0xsalt",
        expiresAt: 1234567890,
      };

      jest
        .spyOn(creditsService, "prepareCreditsCollectionStore")
        .mockReturnValue({
          contract: {
            name: "CreditsManager",
            address: "0xCreditsManagerAddress",
            abi: [],
            version: "1",
            chainId: ChainId.MATIC_AMOY,
          },
          creditsData: [
            { value: "100", expiresAt: 1234567890, salt: "0xsalt1" },
          ],
          creditsSignatures: ["0xsignature1"],
          externalCall: extendedExternalCall,
          maxUncreditedValue: "900",
          maxCreditedValue: "1000",
        });

      await creditsService.useCreditsCollectionStore(
        item,
        walletAddress,
        credits,
      );

      expect(creditsService.prepareCreditsCollectionStore).toHaveBeenCalledWith(
        item,
        walletAddress,
        credits,
      );
      expect(mockSendTransaction).toHaveBeenCalledWith(
        {
          name: "CreditsManager",
          address: "0xCreditsManagerAddress",
          abi: [],
          version: "1",
          chainId: ChainId.MATIC_AMOY,
        },
        "useCredits",
        {
          credits: [{ value: "100", expiresAt: 1234567890, salt: "0xsalt1" }],
          creditsSignatures: ["0xsignature1"],
          externalCall: extendedExternalCall,
          customExternalCallSignature: "0x",
          maxUncreditedValue: "900",
          maxCreditedValue: "1000",
        },
      );
    });
  });

  describe("prepareCreditsMarketplace", () => {
    let trade: Trade;
    beforeEach(() => {
      trade = {
        id: "trade1",
        createdAt: Date.now(),
        signer: "0x0000000000000000000000000000000000000123",
        signature:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        type: TradeType.PUBLIC_NFT_ORDER,
        contract: getContract(
          ContractName.OffChainMarketplaceV2,
          ChainId.MATIC_AMOY,
        ).address,
        network: Network.MATIC,
        chainId: ChainId.MATIC_AMOY,
        checks: {
          expiration: Date.now() + 100000000000,
          effective: Date.now(),
          uses: 1,
          salt: "0x",
          allowedRoot: "0x",
          contractSignatureIndex: 0,
          externalChecks: [],
          signerSignatureIndex: 0,
        },
        sent: [
          {
            assetType: TradeAssetType.ERC721,
            contractAddress: "0x7ad72b9f944ea9793cf4055d88f81138cc2c63a0",
            tokenId: "1",
            extra: "",
          },
        ],
        received: [
          {
            assetType: TradeAssetType.ERC20,
            contractAddress: "0x7ad72b9f944ea9793cf4055d88f81138cc2c63a0",
            amount: "2000000000000000000",
            extra: "",
            beneficiary: "0x0000000000000000000000000000000000000123",
          },
        ],
      };
    });

    it("should prepare credits data for marketplace v3 call", () => {
      const walletAddress = "0x0000000000000000000000000000000000000123";
      const credits: Credit[] = [
        {
          id: "0x123",
          amount: "1000000000000000000",
          expiresAt: "1234567890",
          signature: "0xsignature1",
          availableAmount: "1000000000000000000",
          contract: getContract(ContractName.CreditsManager, ChainId.MATIC_AMOY)
            .address,
          season: 1,
          timestamp: "1234567890",
          userAddress: walletAddress,
        },
      ];

      const result = creditsService.prepareCreditsMarketplace(
        trade,
        walletAddress,
        credits,
      );

      expect(result).toEqual({
        contract: getContract(ContractName.CreditsManager, ChainId.MATIC_AMOY),
        creditsData: [
          {
            value: credits[0].amount,
            expiresAt: 1234567890,
            salt: ethers.utils.hexZeroPad(credits[0].id, 32),
          },
        ],
        creditsSignatures: ["0xsignature1"],
        externalCall: {
          target: getContract(
            ContractName.OffChainMarketplaceV2,
            ChainId.MATIC_AMOY,
          ).address,
          selector: "0x961a547e",
          data: ethers.utils.defaultAbiCoder.encode(
            [
              "tuple(address signer, bytes signature, tuple(uint256 uses, uint256 expiration, uint256 effective, bytes32 salt, uint256 contractSignatureIndex, uint256 signerSignatureIndex, bytes32 allowedRoot, bytes32[] allowedProof, tuple(address contractAddress, bytes4 selector, bytes value, bool required)[] externalChecks) checks, tuple(uint256 assetType, address contractAddress, uint256 value, address beneficiary, bytes extra)[] sent, tuple(uint256 assetType, address contractAddress, uint256 value, address beneficiary, bytes extra)[] received)[]",
            ],
            [[getOnChainTrade(trade, walletAddress)]],
          ),
          expiresAt: expect.any(Number),
          salt: expect.any(String),
        },
        maxUncreditedValue: (
          BigInt((trade.received[0] as ERC20TradeAsset).amount) -
          BigInt(credits[0].amount)
        ).toString(),
        maxCreditedValue: (trade.received[0] as ERC20TradeAsset).amount,
      });
    });
  });

  describe("useCreditsMarketplace", () => {
    it("should execute useCredits for marketplace", async () => {
      const trade = {
        id: "trade1",
        chainId: ChainId.MATIC_AMOY,
        type: TradeType.BID,
        network: Network.ETHEREUM,
        signer: "0xsigner",
        signature: "0xsignature",
        createdAt: 1234567890000,
        checks: {
          expiration: 1234567890000,
          effective: 1234567890000,
          uses: 1,
          salt: "0xsalt",
          allowedRoot: "0xallowedRoot",
          contractSignatureIndex: 0,
          externalChecks: [],
          signerSignatureIndex: 0,
        },
        sent: [],
        received: [
          {
            assetType: TradeAssetType.ERC20,
            amount: "1000",
            contractAddress: "0xmana",
            beneficiary: "0xbeneficiary",
          },
        ],
      } as unknown as Trade;

      const walletAddress = "0xuser";
      const credits: Credit[] = [
        {
          id: "credit1",
          amount: "100",
          expiresAt: "1234567890",
          signature: "0xsignature1",
          availableAmount: "100",
          contract: "0xcontract",
          season: 1,
          timestamp: "1234567890",
          userAddress: "0xuser",
        },
      ];

      // Create a spy with the extended type
      const extendedExternalCall: ExtendedExternalCall = {
        target: "0xtarget",
        selector: "0xselector",
        data: "0xdata",
        salt: "0xsalt",
        expiresAt: 1234567890,
      };

      jest.spyOn(creditsService, "prepareCreditsMarketplace").mockReturnValue({
        contract: {
          name: "CreditsManager",
          address: "0xCreditsManagerAddress",
          abi: [],
          version: "1",
          chainId: ChainId.MATIC_AMOY,
        },
        creditsData: [{ value: "100", expiresAt: 1234567890, salt: "0xsalt1" }],
        creditsSignatures: ["0xsignature1"],
        externalCall: extendedExternalCall,
        maxUncreditedValue: "900",
        maxCreditedValue: "1000",
      });

      await creditsService.useCreditsMarketplace(trade, walletAddress, credits);

      expect(creditsService.prepareCreditsMarketplace).toHaveBeenCalledWith(
        trade,
        walletAddress,
        credits,
      );
      expect(mockSendTransaction).toHaveBeenCalledWith(
        {
          name: "CreditsManager",
          address: "0xCreditsManagerAddress",
          abi: [],
          version: "1",
          chainId: ChainId.MATIC_AMOY,
        },
        "useCredits",
        {
          credits: [{ value: "100", expiresAt: 1234567890, salt: "0xsalt1" }],
          creditsSignatures: ["0xsignature1"],
          externalCall: extendedExternalCall,
          customExternalCallSignature: "0x",
          maxUncreditedValue: "900",
          maxCreditedValue: "1000",
        },
      );
    });
  });

  describe("prepareCreditsLegacyMarketplace", () => {
    let nft: NFT;
    let order: Order;
    beforeEach(() => {
      nft = {
        id: "nft1",
        name: "NFT 1",
        tokenId: "1",
        contractAddress: "0x74b1b01874724bb6223f863d4899e65cf51aaa9f",
        chainId: ChainId.MATIC_AMOY,
        network: Network.MATIC,
      } as unknown as NFT;
      order = {
        id: "order1",
        price: "1000",
        chainId: ChainId.MATIC_AMOY,
        network: Network.MATIC,
        marketplaceAddress: "0x0c8ad1f6aadf89d2eb19f01a100a6143108fe2b0",
        contractAddress: "0x74b1b01874724bb6223f863d4899e65cf51aaa9f",
        tokenId: "1",
        owner: "0xowner",
      } as unknown as Order;
    });
    it("should prepare credits data correctly", () => {
      const credits: Credit[] = [
        {
          id: "0x123",
          amount: "100",
          expiresAt: "1234567890",
          signature: "0xsignature1",
          availableAmount: "100",
          contract: getContract(ContractName.CreditsManager, ChainId.MATIC_AMOY)
            .address,
          season: 1,
          timestamp: "1234567890",
          userAddress: "0xuser",
        },
      ];

      const result = creditsService["prepareCreditsLegacyMarketplace"](
        nft,
        order,
        credits,
      );

      expect(result.contract).toEqual(
        getContract(ContractName.CreditsManager, ChainId.MATIC_AMOY),
      );
      expect(result.creditsData).toEqual([
        {
          value: "100",
          expiresAt: 1234567890,
          salt: ethers.utils.hexZeroPad("0x123", 32),
        },
      ]);
      expect(result.creditsSignatures).toEqual(["0xsignature1"]);
      expect(result.externalCall).toEqual({
        target: getContract(ContractName.MarketplaceV2, ChainId.MATIC_AMOY)
          .address,
        selector: "0xae7b0333",
        data: ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256", "uint256"],
          [nft.contractAddress, nft.tokenId, order.price],
        ),
        expiresAt: expect.any(Number),
        salt: expect.any(String),
      });
      expect(result.maxUncreditedValue).toEqual("900");
      expect(result.maxCreditedValue).toEqual("1000");
    });
  });

  describe("useCreditsLegacyMarketplace", () => {
    it("should execute useCredits for legacy marketplace", async () => {
      const nft = {
        id: "nft1",
        name: "NFT 1",
        description: "Description",
        tokenId: "1",
        contractAddress: "0xnftContract",
        chainId: ChainId.MATIC_AMOY,
        network: Network.ETHEREUM,
      } as unknown as NFT;

      const order = {
        id: "order1",
        price: "1000",
        chainId: ChainId.MATIC_AMOY,
        network: Network.ETHEREUM,
      } as unknown as Order;

      const credits: Credit[] = [
        {
          id: "credit1",
          amount: "100",
          expiresAt: "1234567890",
          signature: "0xsignature1",
          availableAmount: "100",
          contract: "0xcontract",
          season: 1,
          timestamp: "1234567890",
          userAddress: "0xuser",
        },
      ];

      // Create a spy with the extended type
      const extendedExternalCall: ExtendedExternalCall = {
        target: "0xtarget",
        selector: "0xselector",
        data: "0xdata",
        salt: "0xsalt",
        expiresAt: 1234567890,
      };

      jest
        .spyOn(creditsService, "prepareCreditsLegacyMarketplace")
        .mockReturnValue({
          contract: {
            name: "CreditsManager",
            address: "0xCreditsManagerAddress",
            abi: [],
            version: "1",
            chainId: ChainId.MATIC_AMOY,
          },
          creditsData: [
            { value: "100", expiresAt: 1234567890, salt: "0xsalt1" },
          ],
          creditsSignatures: ["0xsignature1"],
          externalCall: extendedExternalCall,
          maxUncreditedValue: "900",
          maxCreditedValue: "1000",
        });

      await creditsService.useCreditsLegacyMarketplace(nft, order, credits);

      expect(
        creditsService.prepareCreditsLegacyMarketplace,
      ).toHaveBeenCalledWith(nft, order, credits);
      expect(mockSendTransaction).toHaveBeenCalledWith(
        {
          name: "CreditsManager",
          address: "0xCreditsManagerAddress",
          abi: [],
          version: "1",
          chainId: ChainId.MATIC_AMOY,
        },
        "useCredits",
        {
          credits: [{ value: "100", expiresAt: 1234567890, salt: "0xsalt1" }],
          creditsSignatures: ["0xsignature1"],
          externalCall: extendedExternalCall,
          customExternalCallSignature: "0x",
          maxUncreditedValue: "900",
          maxCreditedValue: "1000",
        },
      );
    });
  });

  describe("getTradePrice", () => {
    it("should get the price from an ERC20 trade asset in received", () => {
      const trade = {
        received: [
          {
            assetType: TradeAssetType.ERC20,
            amount: "1000",
            contractAddress: "0xmana",
          },
        ],
      } as unknown as Trade;

      // @ts-ignore: Accessing private method
      const result = creditsService["getTradePrice"](trade);
      expect(result).toBe("1000");
    });

    it("should return 0 if no ERC20 asset is found", () => {
      const trade = {
        received: [
          {
            assetType: TradeAssetType.ERC721,
            tokenId: "123",
            contractAddress: "0xnft",
          },
        ],
      } as unknown as Trade;

      // @ts-ignore: Accessing private method
      const result = creditsService["getTradePrice"](trade);
      expect(result).toBe("0");
    });
  });

  describe("prepareCreditsCollectionManager", () => {
    let credits: Credit[];
    let collectionManagerArgs: CollectionManagerCreateCollectionArgs;
    let totalPrice: string;

    beforeEach(() => {
      credits = [
        {
          id: "0x123",
          amount: "100",
          expiresAt: "1234567890",
          signature: "0xsignature1",
          availableAmount: "100",
          contract: getContract(ContractName.CreditsManager, ChainId.MATIC_AMOY)
            .address,
          season: 1,
          timestamp: "1234567890",
          userAddress: "0xuser",
        },
      ];
      collectionManagerArgs = [
        "0x0000000000000000000000000000000000000001", // forwarder - valid address
        "0x0000000000000000000000000000000000000002", // factory - valid address
        ethers.utils.hexZeroPad("0x123", 32), // salt as bytes32
        "Collection Name",
        "COL",
        "baseURI",
        "0x0000000000000000000000000000000000000003", // creator - valid address
        [
          [
            "rarity1",
            "1000",
            "0x0000000000000000000000000000000000000004",
            "metadata",
          ],
        ],
      ];
      totalPrice = "1000";
    });

    it("should prepare credits data for collection manager call", () => {
      const result = creditsService.prepareCreditsCollectionManager(
        credits,
        ChainId.MATIC_AMOY,
        collectionManagerArgs,
        totalPrice,
      );

      expect(result.contract).toEqual(
        getContract(ContractName.CreditsManager, ChainId.MATIC_AMOY),
      );
      expect(result.creditsData).toEqual([
        {
          value: "100",
          expiresAt: 1234567890,
          salt: ethers.utils.hexZeroPad("0x123", 32),
        },
      ]);
      expect(result.creditsSignatures).toEqual(["0xsignature1"]);
      expect(result.externalCall.target).toEqual(
        getContract(ContractName.CollectionManager, ChainId.MATIC_AMOY).address,
      );
      expect(result.externalCall.selector).toBeDefined();
      expect(result.externalCall.data).toContain(
        "436f6c6c656374696f6e204e616d65",
      ); // "Collection Name" in hex
      expect(result.externalCall.data).toContain("434f4c"); // "COL" in hex
      expect(result.externalCall.expiresAt).toBeDefined();
      expect(result.externalCall.salt).toBeDefined();
      expect(result.maxUncreditedValue).toEqual("900");
      expect(result.maxCreditedValue).toEqual("1000");
    });
  });

  describe("useCreditsCollectionManager", () => {
    let mockFetch: jest.Mock;
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
      mockFetch = jest.fn();
      global.fetch = mockFetch;

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          signature: "0xcustomSignature",
        }),
      } as any);
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    describe("when signing the external call", () => {
      let walletAddress: string;
      let credits: Credit[];
      let collectionManagerArgs: CollectionManagerCreateCollectionArgs;
      let totalPrice: string;
      let creditsServerUrl: string;

      beforeEach(() => {
        walletAddress = "0xuser";
        credits = [
          {
            id: "credit1",
            amount: "100",
            expiresAt: "1234567890",
            signature: "0xsignature1",
            availableAmount: "100",
            contract: getContract(
              ContractName.CreditsManager,
              ChainId.MATIC_AMOY,
            ).address,
            season: 1,
            timestamp: "1234567890",
            userAddress: "0xuser",
          },
        ];
        collectionManagerArgs = [
          "0x0000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000002",
          ethers.utils.hexZeroPad("0x123", 32),
          "Collection Name",
          "COL",
          "baseURI",
          "0x0000000000000000000000000000000000000003",
          [
            [
              "rarity1",
              "1000",
              "0x0000000000000000000000000000000000000004",
              "metadata",
            ],
          ],
        ];
        totalPrice = "1000";
        creditsServerUrl = "https://credits-server.com";
      });

      it("should call the credits server for signature", async () => {
        await creditsService.useCreditsCollectionManager(
          walletAddress,
          credits,
          ChainId.MATIC_AMOY,
          collectionManagerArgs,
          totalPrice,
          creditsServerUrl,
        );

        expect(mockFetch).toHaveBeenCalledWith(
          `${creditsServerUrl}/sign-external-call`,
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: expect.stringContaining(walletAddress),
          }),
        );
      });

      it("should execute useCredits with the signature", async () => {
        await creditsService.useCreditsCollectionManager(
          walletAddress,
          credits,
          ChainId.MATIC_AMOY,
          collectionManagerArgs,
          totalPrice,
          creditsServerUrl,
        );

        expect(mockSendTransaction).toHaveBeenCalledWith(
          expect.any(Object),
          "useCredits",
          expect.objectContaining({
            customExternalCallSignature: "0xcustomSignature",
          }),
        );
      });
    });

    describe("and the signature request fails", () => {
      beforeEach(() => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: jest.fn().mockResolvedValue({
            error: "Signature failed",
          }),
        } as any);
      });

      it("should throw an error", async () => {
        await expect(
          creditsService.useCreditsCollectionManager(
            "0xuser",
            [
              {
                id: "credit1",
                amount: "100",
                expiresAt: "1234567890",
                signature: "0xsignature1",
                availableAmount: "100",
                contract: getContract(
                  ContractName.CreditsManager,
                  ChainId.MATIC_AMOY,
                ).address,
                season: 1,
                timestamp: "1234567890",
                userAddress: "0xuser",
              },
            ],
            ChainId.MATIC_AMOY,
            [
              "0x0000000000000000000000000000000000000001",
              "0x0000000000000000000000000000000000000002",
              ethers.utils.hexZeroPad("0x123", 32),
              "Name",
              "SYM",
              "uri",
              "0x0000000000000000000000000000000000000003",
              [],
            ],
            "1000",
            "https://credits-server.com",
          ),
        ).rejects.toThrow("Failed to get external call signature");
      });
    });
  });

  describe("useCreditsWithExternalCall", () => {
    let price: string;
    let chainId: ChainId;
    let externalCall: ExternalCallParams;
    let customExternalCallSignature: string;

    beforeEach(() => {
      price = "100000000000000000000"; // 100 MANA
      chainId = ChainId.MATIC_MAINNET;
      externalCall = {
        target: "0xCreditExecutor",
        selector: "0xabcdef",
        data: "0xcoralRouterCalldata",
        expiresAt: 1234567890,
        salt: "0x123",
      };
      customExternalCallSignature = "0xsignatureFromBackend";
    });

    describe("when credits exceed price", () => {
      let credits: Credit[];

      beforeEach(() => {
        credits = [
          {
            id: "credit1",
            amount: "150000000000000000000", // 150 MANA in credits (exceeds 100 MANA price)
            expiresAt: "1234567890",
            signature: "0xsignature1",
            availableAmount: "150000000000000000000",
            contract: getContract(
              ContractName.CreditsManager,
              ChainId.MATIC_MAINNET,
            ).address,
            season: 1,
            timestamp: "1234567890",
            userAddress: "0xuser",
          },
        ];
      });

      it("should calculate maxUncreditedValue as 0", async () => {
        await creditsService.useCreditsWithExternalCall(
          price,
          credits,
          chainId,
          externalCall,
          customExternalCallSignature,
        );

        // Credits (150) > Price (100), so maxUncreditedValue should be '0'
        expect(mockSendTransaction).toHaveBeenCalledWith(
          expect.any(Object),
          "useCredits",
          expect.objectContaining({
            customExternalCallSignature,
            maxCreditedValue: price,
            maxUncreditedValue: "0", // No MANA needed
          }),
        );
      });

      it("should execute useCredits with correct parameters", async () => {
        await creditsService.useCreditsWithExternalCall(
          price,
          credits,
          chainId,
          externalCall,
          customExternalCallSignature,
        );

        expect(mockSendTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            address: getContract(ContractName.CreditsManager, chainId).address,
          }),
          "useCredits",
          expect.objectContaining({
            credits: expect.arrayContaining([
              expect.objectContaining({
                value: credits[0].amount,
                expiresAt: parseInt(credits[0].expiresAt),
              }),
            ]),
            creditsSignatures: ["0xsignature1"],
            externalCall: expect.objectContaining({
              target: externalCall.target,
              selector: externalCall.selector,
              data: externalCall.data,
            }),
            customExternalCallSignature,
            maxCreditedValue: price,
            maxUncreditedValue: "0",
          }),
        );
      });

      it("should return transaction hash", async () => {
        const txHash = await creditsService.useCreditsWithExternalCall(
          price,
          credits,
          chainId,
          externalCall,
          customExternalCallSignature,
        );

        expect(txHash).toBe("0xtransactionHash");
      });
    });

    describe("and credits are less than price", () => {
      let credits: Credit[];

      beforeEach(() => {
        credits = [
          {
            id: "credit1",
            amount: "50000000000000000000", // 50 MANA in credits (less than 100 MANA price)
            expiresAt: "1234567890",
            signature: "0xsignature1",
            availableAmount: "50000000000000000000",
            contract: getContract(
              ContractName.CreditsManager,
              ChainId.MATIC_MAINNET,
            ).address,
            season: 1,
            timestamp: "1234567890",
            userAddress: "0xuser",
          },
        ];
      });

      it("should calculate maxUncreditedValue correctly for hybrid purchase", async () => {
        await creditsService.useCreditsWithExternalCall(
          price,
          credits,
          chainId,
          externalCall,
          customExternalCallSignature,
        );

        // Credits (50) < Price (100), so user needs to pay 50 MANA
        expect(mockSendTransaction).toHaveBeenCalledWith(
          expect.any(Object),
          "useCredits",
          expect.objectContaining({
            customExternalCallSignature,
            maxCreditedValue: price,
            maxUncreditedValue: "50000000000000000000", // 50 MANA needed
          }),
        );
      });

      it("should execute useCredits with correct parameters", async () => {
        await creditsService.useCreditsWithExternalCall(
          price,
          credits,
          chainId,
          externalCall,
          customExternalCallSignature,
        );

        expect(mockSendTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            address: getContract(ContractName.CreditsManager, chainId).address,
          }),
          "useCredits",
          expect.objectContaining({
            credits: expect.arrayContaining([
              expect.objectContaining({
                value: credits[0].amount,
                expiresAt: parseInt(credits[0].expiresAt),
              }),
            ]),
            creditsSignatures: ["0xsignature1"],
            externalCall: expect.objectContaining({
              target: externalCall.target,
              selector: externalCall.selector,
              data: externalCall.data,
            }),
            customExternalCallSignature,
            maxCreditedValue: price,
            maxUncreditedValue: "50000000000000000000",
          }),
        );
      });

      it("should return transaction hash", async () => {
        const txHash = await creditsService.useCreditsWithExternalCall(
          price,
          credits,
          chainId,
          externalCall,
          customExternalCallSignature,
        );

        expect(txHash).toBe("0xtransactionHash");
      });
    });
  });
});
