import { AnyAction } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { ChainId } from "@dcl/schemas/dist/dapps/chain-id";
import {
  fetchTransactionFailure,
  fetchTransactionRequest,
  fetchTransactionSuccess,
  replaceTransactionSuccess,
  updateTransactionStatus,
} from "./actions";
import {
  ActionWithTransactionPayload,
  CrossChainProviderType,
  Transaction,
  TransactionPayload,
  TransactionStatus,
  TRANSACTION_ACTION_FLAG,
} from "./types";
import {
  buildTransactionPayload,
  buildTransactionWithReceiptPayload,
  isTransactionAction,
  getTransactionFromAction,
  getTransactionHashFromAction,
  waitForTx,
  buildTransactionWithFromPayload,
  getTransactionHref,
  isTransactionActionCrossChain,
  buildCrossChainTransactionFromPayload,
} from "./utils";

describe("modules", () => {
  let tx: TransactionPayload["_watch_tx"];
  let hash: string;
  let from: string;
  let payload: any;
  let chainId: ChainId;

  beforeEach(() => {
    hash = "0xdeadbeef";
    payload = { some: "data" };
    chainId = ChainId.ETHEREUM_MAINNET;
    from = "0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2";
    tx = { hash, payload, chainId, toChainId: chainId };
  });

  describe("transaction", () => {
    describe("utils", () => {
      describe("buildTransactionPayload", () => {
        let tx: TransactionPayload["_watch_tx"];

        beforeEach(() => {
          tx = { hash, payload, chainId, toChainId: chainId };
        });

        it("should return a new object with the transaction flag an the action inside", () => {
          const txPayload = buildTransactionPayload(
            chainId,
            tx.hash,
            tx.payload,
          );

          expect(txPayload).toEqual({
            [TRANSACTION_ACTION_FLAG]: tx,
          });
        });
      });

      describe("buildTransactionWithReceiptPayload", () => {
        let txWithReceipt: TransactionPayload["_watch_tx"];

        beforeEach(() => {
          txWithReceipt = {
            hash,
            payload,
            chainId,
            toChainId: chainId,
            withReceipt: true,
          };
        });

        it("should return a new object with the transaction flag an the action inside", () => {
          const txPayload = buildTransactionWithReceiptPayload(
            chainId,
            txWithReceipt.hash,
            txWithReceipt.payload,
          );

          expect(txPayload).toEqual({
            [TRANSACTION_ACTION_FLAG]: txWithReceipt,
          });
        });
      });

      describe("buildTransactionWithFromPayload", () => {
        let txWithFrom: TransactionPayload["_watch_tx"];

        beforeEach(() => {
          txWithFrom = {
            hash,
            payload,
            chainId,
            from,
            toChainId: chainId,
          };
        });

        it("should return a new object with the transaction flag and the action inside", function () {
          const txPayload = buildTransactionWithFromPayload(
            chainId,
            txWithFrom.hash,
            from,
            payload,
          );

          expect(txPayload).toEqual({
            [TRANSACTION_ACTION_FLAG]: txWithFrom,
          });
        });
      });

      describe("isTransactionAction", () => {
        it("should return true if the action was built with buildTransactionPayload", () => {
          const txPayload = buildTransactionPayload(
            chainId,
            tx.hash,
            tx.payload,
          );
          const action = {
            type: "[Success] Transaction action",
            payload: txPayload,
          };

          expect(isTransactionAction(action)).toBe(true);
        });

        it("should return true if the action was built with buildTransactionWithReceiptPayload", function () {
          const txPayload = buildTransactionWithReceiptPayload(
            chainId,
            tx.hash,
            tx.payload,
          );
          const action = {
            type: "[Success] Transaction action",
            payload: txPayload,
          };

          expect(isTransactionAction(action)).toBe(true);
        });

        it("should return false for normal actions", function () {
          expect(
            isTransactionAction({
              type: "[Success] Some success action",
            }),
          ).toBe(false);

          expect(
            isTransactionAction({
              type: "[Request] Some request action",
              payload: {
                mock_transaction_flag: tx,
              },
            }),
          ).toBe(false);
        });
      });

      describe("getTransactionFromAction", () => {
        let expectedTx: Transaction;
        let action: ActionWithTransactionPayload;

        beforeEach(() => {
          expectedTx = {
            actionType: "[Success] Transaction action",
            hash: "0xdeadbeef",
            chainId: ChainId.ETHEREUM_MAINNET,
            events: [],
            from: "",
            isCrossChain: false,
            nonce: null,
            replacedBy: null,
            requestId: undefined,
            status: null,
            timestamp: expect.any(Number),
            url: "",
          };
        });

        describe("when building a transaction with buildTransactionWithReceiptPayload", () => {
          beforeEach(() => {
            const txPayload = buildTransactionWithReceiptPayload(
              chainId,
              tx.hash,
              tx.payload,
            );
            action = {
              type: "[Success] Transaction action",
              payload: {
                this: "is",
                more: 2,
                data: ["a", 3],
                ...txPayload,
              },
            };
            expectedTx = {
              ...expectedTx,
              actionType: action.type,
              hash: action.payload._watch_tx.hash,
              url: getTransactionHref(
                { txHash: action.payload._watch_tx.hash },
                chainId,
              ),
              payload: action.payload._watch_tx.payload,
              toChainId: action.payload._watch_tx.toChainId,
              withReceipt: action.payload._watch_tx.withReceipt,
            };
          });

          it("should return the transaction with the receipt flag set", () => {
            expect(getTransactionFromAction(action)).toEqual(expectedTx);
          });
        });

        describe("when building a transaction with buildTransactionPayload", () => {
          beforeEach(() => {
            const txPayload = buildTransactionPayload(
              chainId,
              tx.hash,
              tx.payload,
            );
            action = {
              type: "[Success] Transaction action",
              payload: {
                this: "is",
                more: 2,
                data: ["a", 3],
                ...txPayload,
              },
            };
            expectedTx = {
              ...expectedTx,
              actionType: action.type,
              hash: action.payload._watch_tx.hash,
              url: getTransactionHref(
                { txHash: action.payload._watch_tx.hash },
                chainId,
              ),
              toChainId: action.payload._watch_tx.toChainId,
              payload: action.payload._watch_tx.payload,
            };
          });

          it("should return the transaction", () => {
            expect(getTransactionFromAction(action)).toEqual(expectedTx);
          });
        });

        describe("when building a transaction with buildCrossChainTransactionPayload", () => {
          let crossChainProviderType: CrossChainProviderType;
          let requestId: string;
          let toChainId: ChainId;

          beforeEach(() => {
            toChainId = ChainId.ARBITRUM_MAINNET;
            requestId = "aRequestId";
            crossChainProviderType = CrossChainProviderType.SQUID;

            const txPayload = buildCrossChainTransactionFromPayload(
              chainId,
              toChainId,
              tx.hash,
              tx.payload,
              requestId,
              crossChainProviderType,
            );
            action = {
              type: "[Success] Transaction action",
              payload: {
                this: "is",
                more: 2,
                data: ["a", 3],
                ...txPayload,
              },
            };
            expectedTx = {
              ...expectedTx,
              actionType: action.type,
              hash: action.payload._watch_tx.hash,
              url: getTransactionHref(
                {
                  txHash: action.payload._watch_tx.hash,
                  crossChainProviderType,
                },
                chainId,
              ),
              isCrossChain: true,
              requestId: action.payload._watch_tx.requestId,
              toChainId: action.payload._watch_tx.toChainId,
              crossChainProviderType:
                action.payload._watch_tx.crossChainProviderType,
              payload: action.payload._watch_tx.payload,
            };
          });

          it("should return a transaction with the toChain and crossChainProviderType set", () => {
            expect(getTransactionFromAction(action)).toEqual(expectedTx);
          });
        });
      });

      describe("getTransactionHashFromAction", () => {
        it("should return the transaction hash from a built transaction action with buildTransactionPayload", function () {
          const txPayload = buildTransactionPayload(
            chainId,
            tx.hash,
            tx.payload,
          );
          const action = {
            type: "[Success] Transaction action",
            payload: { data: ["a", 3], ...txPayload },
          };

          expect(getTransactionHashFromAction(action)).toEqual(tx.hash);
        });

        it("should return the transaction hash from a built transaction action with buildTransactionWithReceiptPayload", function () {
          const txPayload = buildTransactionWithReceiptPayload(
            chainId,
            tx.hash,
            tx.payload,
          );
          const action = {
            type: "[Success] Transaction action",
            payload: { data: ["a", 3], ...txPayload },
          };

          expect(getTransactionHashFromAction(action)).toEqual(tx.hash);
        });

        it("should throw for a normal action (use isTransactionAction to avoid it)", function () {
          const action = {
            type: "[Success] Transaction action",
            payload: { more: 2 },
          };

          expect(() => getTransactionHashFromAction(action as any)).toThrow();
        });
      });
    });
  });
});

describe("when waiting for a transaction to be completed", () => {
  const txHash =
    "0x654439c89c379f2b3083b4bdbd28c9cf57a0754d625c1353c800c09e073040c6";
  const senderAddress = "0xc4445E5BCDE63C318909fd10318734b27906f7b6";
  const anotherAddress = "0x2Da846e95E22cd84fdF7986dE99db221e6765444";
  let transaction: Transaction;
  let anotherTransaction: Transaction;

  beforeEach(() => {
    transaction = {
      events: [],
      hash: txHash,
      nonce: 0,
      replacedBy: null,
      timestamp: Date.now(),
      from: senderAddress,
      actionType: "anActionType",
      status: null,
      url: "",
      isCrossChain: false,
      chainId: ChainId.ETHEREUM_GOERLI,
    };

    anotherTransaction = {
      ...transaction,
      hash: anotherAddress,
    };

    // Mute console error when running the expect saga implementation and throwing
    jest.spyOn(global.console, "error").mockImplementation(jest.fn());
  });

  afterEach(() => {
    (global.console.error as unknown as jest.SpyInstance).mockRestore();
  });

  describe("and the transaction results in a REVERTED failure", () => {
    it("should throw an error saying that the transaction was not successful", () => {
      return expectSaga(waitForTx, txHash)
        .dispatch(
          fetchTransactionFailure(
            anotherAddress,
            TransactionStatus.REVERTED,
            "aFailureMessage",
            anotherTransaction,
          ),
        )
        .dispatch(
          fetchTransactionFailure(
            txHash,
            TransactionStatus.REVERTED,
            "aFailureMessage",
            transaction,
          ),
        )
        .throws(
          `The transaction ${txHash} failed to be mined. The status is ${TransactionStatus.REVERTED}.`,
        )
        .silentRun();
    });
  });

  describe("and the transaction results in a DROPPED failure that is later replaced with another one", () => {
    let newTxHash: string;

    beforeEach(() => {
      newTxHash = "aNewTransactionHash";
    });

    describe("and the new transaction is REVERTED", () => {
      it("should throw an error saying that the transaction was not successful", () => {
        return expectSaga(waitForTx, txHash)
          .dispatch(
            fetchTransactionFailure(
              txHash,
              TransactionStatus.DROPPED,
              "aFailureMessage",
              transaction,
            ),
          )
          .dispatch(replaceTransactionSuccess(txHash, newTxHash))
          .dispatch(
            fetchTransactionFailure(
              newTxHash,
              TransactionStatus.REVERTED,
              "aFailureMessage",
              { ...transaction, hash: newTxHash },
            ),
          )
          .throws(
            `The transaction ${newTxHash} failed to be mined. The status is ${TransactionStatus.REVERTED}.`,
          )
          .silentRun();
      });
    });

    describe("and the new transaction is CONFIRMED", () => {
      it("should finish the saga's execution", () => {
        return expectSaga(waitForTx, txHash)
          .dispatch(
            fetchTransactionFailure(
              txHash,
              TransactionStatus.DROPPED,
              "aFailureMessage",
              transaction,
            ),
          )
          .dispatch(replaceTransactionSuccess(txHash, newTxHash))
          .dispatch(
            fetchTransactionSuccess({ ...transaction, hash: newTxHash }),
          )
          .silentRun();
      });
    });
  });

  describe("and the transaction results in a DROPPED failure that is re-fetched", () => {
    describe("and the new transaction is REVERTED", () => {
      it("should throw an error saying that the transaction was not successful", () => {
        return expectSaga(waitForTx, txHash)
          .dispatch(
            fetchTransactionFailure(
              txHash,
              TransactionStatus.DROPPED,
              "aFailureMessage",
              transaction,
            ),
          )
          .dispatch(
            fetchTransactionRequest("anAddress", txHash, {
              type: "SomeAction",
              payload: { _watch_tx: { hash: txHash } } as TransactionPayload,
            }),
          )
          .dispatch(
            fetchTransactionFailure(
              txHash,
              TransactionStatus.REVERTED,
              "aFailureMessage",
              transaction,
            ),
          )
          .throws(
            `The transaction ${txHash} failed to be mined. The status is ${TransactionStatus.REVERTED}.`,
          )
          .silentRun();
      });
    });

    describe("and the new transaction is CONFIRMED", () => {
      it("should finish the saga's execution", () => {
        return expectSaga(waitForTx, txHash)
          .dispatch(
            fetchTransactionFailure(
              txHash,
              TransactionStatus.DROPPED,
              "aFailureMessage",
              transaction,
            ),
          )
          .dispatch(
            fetchTransactionRequest("anAddress", txHash, {
              type: "SomeAction",
              payload: { _watch_tx: { hash: txHash } } as TransactionPayload,
            }),
          )
          .dispatch(fetchTransactionSuccess(transaction))
          .silentRun();
      });
    });
  });

  describe("and the transaction results in a DROPPED failure that results in the transaction updated to REPLACED", () => {
    it("should finish the saga's execution", () => {
      return expectSaga(waitForTx, txHash)
        .dispatch(
          fetchTransactionFailure(
            txHash,
            TransactionStatus.DROPPED,
            "aFailureMessage",
            transaction,
          ),
        )
        .dispatch(updateTransactionStatus(txHash, TransactionStatus.REPLACED))
        .silentRun();
    });
  });

  describe("and the transaction results successful", () => {
    it("should finish the saga's execution", () => {
      return expectSaga(waitForTx, txHash)
        .dispatch(fetchTransactionSuccess(anotherTransaction))
        .dispatch(fetchTransactionSuccess(transaction))
        .silentRun();
    });
  });
});

describe("when getting the transaction href", () => {
  let txHash: string | undefined;
  let address: string | undefined;
  let blockNumber: number | undefined;
  let network: ChainId | undefined;
  let crossChainProviderType: CrossChainProviderType | undefined;

  beforeEach(() => {
    network = ChainId.ETHEREUM_MAINNET;
    txHash = "0xdeadbeef";
  });

  describe("and the transaction comes from a cross chain one", () => {
    describe("and the provider type is squid", () => {
      beforeEach(() => {
        crossChainProviderType = CrossChainProviderType.SQUID;
      });

      it("should return the link to the Axelar site", () => {
        expect(getTransactionHref({ txHash, crossChainProviderType })).toBe(
          `https://axelarscan.io/gmp/${txHash}`,
        );
      });
    });

    describe("and the provider type is unknown", () => {
      beforeEach(() => {
        crossChainProviderType = "Unknown" as CrossChainProviderType;
      });

      it("should return the link to the Axelar site", () => {
        expect(getTransactionHref({ txHash, crossChainProviderType })).toBe("");
      });
    });
  });

  describe("and the transaction comes from a regular chain", () => {
    beforeEach(() => {
      crossChainProviderType = undefined;
    });

    describe("and the address is set", () => {
      beforeEach(() => {
        address = "0x9c76ae45c36a4da3801a5ba387bbfa3c073ecae2";
      });

      it("should return the link to the Etherscan site pointing to the address", () => {
        expect(getTransactionHref({ address })).toBe(
          `https://etherscan.io/address/${address}`,
        );
      });
    });

    describe("and the address is not set", () => {
      beforeEach(() => {
        address = undefined;
      });

      describe("and the block number is set", () => {
        beforeEach(() => {
          blockNumber = 123;
        });

        it("should return the link to the Etherscan site pointing to the block number", () => {
          expect(getTransactionHref({ blockNumber })).toBe(
            `https://etherscan.io/block/${blockNumber}`,
          );
        });
      });

      describe("and the block number is not set", () => {
        beforeEach(() => {
          blockNumber = undefined;
        });

        it("should return the link to the Etherscan site pointing to the transaction", () => {
          expect(getTransactionHref({ txHash })).toBe(
            `https://etherscan.io/tx/${txHash}`,
          );
        });
      });
    });

    describe("and the chain is set as sepolia", () => {
      beforeEach(() => {
        network = ChainId.ETHEREUM_SEPOLIA;
      });

      it("should return the link to the Sepolia site", () => {
        expect(getTransactionHref({ txHash }, network)).toBe(
          `https://sepolia.etherscan.io/tx/${txHash}`,
        );
      });
    });
  });
});

describe("when getting if an action is a cross chain transaction action", () => {
  let action: AnyAction;

  beforeEach(() => {
    action = {
      type: "SomeAction",
    };
  });

  describe("and the action has no transactional information", () => {
    it("should return false", () => {
      expect(isTransactionActionCrossChain(action)).toBe(false);
    });
  });

  describe("and the action has transactional information", () => {
    beforeEach(() => {
      action = {
        ...action,
        payload: {
          _watch_tx: {
            chainId: ChainId.ETHEREUM_MAINNET,
            hash: "0xdeadbeef",
            payload: { some: "data" },
          },
        },
      };
    });

    describe("and the information belongs to a cross chain transaction", () => {
      beforeEach(() => {
        action = {
          ...action,
          payload: {
            ...action.payload,
            _watch_tx: {
              ...action.payload._watch_tx,
              toChainId: ChainId.AVALANCHE_MAINNET,
              crossChainProviderType: CrossChainProviderType.SQUID,
            },
          },
        };
      });

      it("should return true", () => {
        expect(isTransactionActionCrossChain(action)).toBe(true);
      });
    });

    describe("and the information belongs to a non-cross chain transaction", () => {
      beforeEach(() => {
        action = {
          ...action,
          payload: {
            ...action.payload,
            _watch_tx: {
              ...action.payload._watch_tx,
              toChainId: undefined,
              crossChainProviderType: undefined,
            },
          },
        };
      });

      it("should return false", () => {
        expect(isTransactionActionCrossChain(action)).toBe(false);
      });
    });
  });
});
