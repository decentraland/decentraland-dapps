import { select } from "redux-saga/effects";
import { expectSaga } from "redux-saga-test-plan";
import { ChainId } from "@dcl/schemas/dist/dapps/chain-id";
import { Network } from "@dcl/schemas/dist/dapps/network";
import { NetworkGatewayType } from "decentraland-ui";
import { getChainIdByNetwork } from "../../../lib/eth";
import { setPurchase } from "../../gateway/actions";
import { fetchWalletRequest } from "../../wallet/actions";
import { getChainId } from "../../wallet/selectors";
import { Transak } from "../transak/Transak";
import { createGatewaySaga } from "../sagas";
import {
  FiatGateway,
  GatewaySagasConfig,
  NFTPurchase,
  Purchase,
  PurchaseStatus,
} from "../types";
import {
  CustomizationOptions,
  OrderData,
  TradeType,
  TransakOrderStatus,
} from "./types";

jest.mock("../../../lib/eth");

let initMock;
jest.mock("@transak/transak-sdk", () => {
  const actualTransakSDK = jest.requireActual("@transak/transak-sdk");

  return {
    __esModule: true,
    ...actualTransakSDK,
    Transak: jest.fn().mockImplementation((config) => {
      return {
        init: initMock,
      };
    }),
  };
});

const mockGetChainIdByNetwork = getChainIdByNetwork as jest.MockedFunction<
  typeof getChainIdByNetwork
>;

const mockConfig: GatewaySagasConfig = {
  [FiatGateway.WERT]: {
    url: "http://wert-base.url.xyz",
    marketplaceServerURL: "http://marketplace-server.url.xyz",
  },
  [NetworkGatewayType.MOON_PAY]: {
    apiKey: "api-key",
    apiBaseUrl: "http://moonpay-base.url.xyz",
    widgetBaseUrl: "http://widget.base.url.xyz",
    pollingDelay: 50,
  },
  [NetworkGatewayType.TRANSAK]: {
    apiBaseUrl: "http://transak-base.url.xyz",
    pusher: {
      appKey: "appKey",
      appCluster: "appCluster",
    },
  },
};

const mockAddress = "0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2";
const mockOrderData: OrderData = {
  eventName: "event name",
  status: {
    id: "order-id",
    autoExpiresAt: "2022-12-14T14:32:35.396Z",
    conversionPrice: 10,
    convertedFiatAmount: 10,
    convertedFiatCurrency: "MANA",
    createdAt: "2022-12-14T14:32:35.396Z",
    cryptoAmount: 10,
    cryptoCurrency: "MANA",
    cryptocurrency: "MANA",
    envName: "env",
    fiatAmount: 10,
    fiatCurrency: "USD",
    fromWalletAddress: mockAddress,
    isBuyOrSell: "BUY",
    isNFTOrder: false,
    network: "ethereum",
    paymentOptionId: "credit_debit_card",
    quoteId: "quote-id",
    referenceCode: 12345,
    reservationId: "reservation-id",
    status: TransakOrderStatus.PROCESSING,
    totalFeeInFiat: 2,
    transactionHash: "mock-transaction-hash",
    walletAddress: mockAddress,
    walletLink: "wallet-link",
  },
};

const mockOrderDataWithNftAssetInfo = {
  ...mockOrderData,
  status: {
    ...mockOrderData.status,
    isNFTOrder: true,
    nftAssetInfo: {
      collection: "contractAddress",
      tokenId: ["123"],
    },
  },
};

const mockManaPurchase: Purchase = {
  address: mockAddress,
  amount: 10,
  id: mockOrderData.status.id,
  network: Network.ETHEREUM,
  timestamp: 1671028355396,
  status: PurchaseStatus.PENDING,
  paymentMethod: "credit_debit_card",
  gateway: NetworkGatewayType.TRANSAK,
  txHash: "mock-transaction-hash",
};

const mockNftPurchase: NFTPurchase = {
  ...mockManaPurchase,
  nft: {
    contractAddress: "contractAddress",
    tokenId: "123",
    itemId: undefined,
    tradeType: TradeType.SECONDARY,
    cryptoAmount: 10,
  },
};

const gatewaySaga = createGatewaySaga(mockConfig);

describe("when interacting with Transak", () => {
  let transak: Transak;

  beforeEach(() => {
    transak = new Transak(mockConfig[NetworkGatewayType.TRANSAK]!);
    mockGetChainIdByNetwork.mockReturnValue(ChainId.ETHEREUM_GOERLI);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when emitting a purchase event in the purchaseEventsChannel", () => {
    describe("when the status of the purchase is not yet complete", () => {
      it("should put a new message in the channel signaling the set of the purchase without trying to refresh the balance", () => {
        transak.emitPurchaseEvent(mockOrderData.status, Network.ETHEREUM);
        return expectSaga(gatewaySaga)
          .provide([[select(getChainId), ChainId.ETHEREUM_GOERLI]])
          .put(setPurchase(mockManaPurchase))
          .silentRun();
      });
    });

    describe("when the status of the purchase is complete", () => {
      it("should put a new message in the channel signaling the set of the purchase and the request to refresh the balance", () => {
        transak.emitPurchaseEvent(
          {
            ...mockOrderData.status,
            status: TransakOrderStatus.COMPLETED,
          },
          Network.ETHEREUM,
        );
        return expectSaga(gatewaySaga)
          .provide([[select(getChainId), ChainId.ETHEREUM_GOERLI]])
          .put(
            setPurchase({
              ...mockManaPurchase,
              status: PurchaseStatus.COMPLETE,
            }),
          )
          .put(fetchWalletRequest())
          .silentRun();
      });
    });

    describe("when purchasing an NFT", () => {
      let originalHref;
      beforeEach(() => {
        jest.clearAllMocks();
        originalHref = window.location.href;
        Object.defineProperty(window, "location", {
          writable: true, // Allow href to be writable
          value: {
            href: originalHref,
          },
        });
      });
      describe("when it belongs to the secondary market", () => {
        beforeEach(() => {
          Object.defineProperty(window, "location", {
            value: {
              href: "https://decentraland.zone/contracts/contractAddress/tokens/123",
            },
          });
        });

        it("should put a new message in the channel signaling the set of the purchase with the nft info and the token id", () => {
          transak.emitPurchaseEvent(
            mockOrderDataWithNftAssetInfo.status,
            Network.ETHEREUM,
          );

          return expectSaga(gatewaySaga)
            .put(setPurchase({ ...mockNftPurchase, amount: 1 }))
            .silentRun();
        });
      });

      describe("when it belongs to the primary market", () => {
        beforeEach(() => {
          Object.defineProperty(window, "location", {
            value: {
              href: "https://decentraland.zone/contracts/contractAddress/items/234",
            },
          });
        });
        it("should put a new message in the channel signaling the set of the purchase with the nft info and the item id", () => {
          transak.emitPurchaseEvent(
            mockOrderDataWithNftAssetInfo.status,
            Network.ETHEREUM,
          );
          return expectSaga(gatewaySaga)
            .put(
              setPurchase({
                ...mockNftPurchase,
                amount: 1,
                nft: {
                  ...mockNftPurchase.nft,
                  tokenId: undefined,
                  itemId: "234",
                  tradeType: TradeType.PRIMARY,
                },
              }),
            )
            .silentRun();
        });
      });
    });
  });

  describe("when opening the widget", () => {
    let getTransakWidgetUrlSpy: jest.SpyInstance<
      Promise<string>,
      [Omit<CustomizationOptions, "widgetHeight" | "widgetWidth">]
    >;
    const mockWidgetUrl = "https://transak-widget.url";

    beforeEach(() => {
      initMock = jest.fn();
      getTransakWidgetUrlSpy = jest
        .spyOn(transak["marketplaceAPI"], "getTransakWidgetUrl")
        .mockResolvedValue(mockWidgetUrl);
    });

    it("should get the widget url and call the init method from the Transak SDK", async () => {
      await transak.openWidget({
        network: Network.ETHEREUM,
        walletAddress: mockAddress,
      });

      expect(getTransakWidgetUrlSpy).toHaveBeenCalledWith({
        walletAddress: mockAddress,
        defaultNetwork: "ethereum",
      });
      expect(initMock).toHaveBeenCalled();
    });
  });
});
