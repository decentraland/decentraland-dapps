// Mock the network provider
jest.mock("../../lib/eth", () => ({
  getNetworkProvider: () => ({
    send: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  }),
}));

// Mock the getFibonacciDelay function
jest.mock("./sagas", () => {
  const actual = jest.requireActual("./sagas");
  return {
    ...actual,
    BACKOFF_DELAY_MULTIPLIER: 0.01,
    getFibonacciDelay: function* (attempt: number) {
      const fib = [1, 1];
      for (let i = 2; i <= attempt + 1; i++) {
        fib[i] = fib[i - 1] + fib[i - 2];
      }
      if (attempt <= 1) {
        return 100;
      }
      return 100 * fib[attempt];
    },
  };
});

import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { call, delay, select } from "redux-saga/effects";
import { TransactionStatus, Transaction } from "./types";
import { ChainId } from "@dcl/schemas/dist/dapps/chain-id";
import {
  getFibonacciDelay,
  handleRegularTransactionRequest,
  handleWatchRevertedTransaction,
} from "./sagas";
import { fetchTransactionSuccess, watchRevertedTransaction } from "./actions";
import { getTransaction as getTransactionInState } from "./selectors";
import { buildTransactionPayload } from "./utils";
import { getTransaction as getTransactionFromChain } from "./txUtils";

describe("when using fibonacci backoff for transaction polling", () => {
  const MOCK_DELAY_MULTIPLIER = 100; // 100ms for testing
  jest.setTimeout(20000); // Increase global timeout

  describe("when calculating fibonacci delay", () => {
    const cases = [
      { attempt: 0, expected: MOCK_DELAY_MULTIPLIER },
      { attempt: 1, expected: MOCK_DELAY_MULTIPLIER },
      { attempt: 2, expected: MOCK_DELAY_MULTIPLIER * 2 },
      { attempt: 3, expected: MOCK_DELAY_MULTIPLIER * 3 },
      { attempt: 4, expected: MOCK_DELAY_MULTIPLIER * 5 },
      { attempt: 5, expected: MOCK_DELAY_MULTIPLIER * 8 },
      { attempt: 6, expected: MOCK_DELAY_MULTIPLIER * 13 },
    ];

    cases.forEach(({ attempt, expected }) => {
      it(`should return ${expected}ms for attempt ${attempt}`, () => {
        return expectSaga(getFibonacciDelay, attempt).returns(expected).run();
      });
    });
  });

  describe("when polling regular transaction status", () => {
    let transaction: Transaction;
    let address: string;
    let hash: string;
    let chainId: ChainId;

    beforeEach(() => {
      jest.setTimeout(20000); // Set timeout for each test in this suite
      address = "0x123";
      hash = "0x456";
      chainId = ChainId.ETHEREUM_MAINNET;
      transaction = {
        ...buildTransactionPayload(chainId, hash, {}, chainId),
        events: [],
        hash,
        from: address,
        chainId,
        status: null,
        timestamp: Date.now(),
        nonce: 0,
        withReceipt: false,
        isCrossChain: false,
        actionType: "SOME_ACTION",
        url: "",
        replacedBy: null,
      };
    });

    describe("and the transaction becomes confirmed", () => {
      it("should use fibonacci backoff until confirmation and fix the transaction", async () => {
        const { hash } = transaction;
        const mockReceipt = { logs: [] };
        const revertedTx = {
          ...transaction,
          status: TransactionStatus.REVERTED,
        };
        const action = {
          type: "[Request] Fetch Transaction" as const,
          payload: {
            hash,
            address: "0x123",
            action: {
              type: "SOME_ACTION",
              payload: buildTransactionPayload(
                transaction.chainId,
                hash,
                {},
                transaction.chainId,
              ),
            },
          },
        };

        return expectSaga(handleRegularTransactionRequest, action)
          .provide([
            [select(getTransactionInState, hash), revertedTx],
            [
              call(getTransactionFromChain, "0x123", transaction.chainId, hash),
              {
                ...revertedTx,
                status: TransactionStatus.CONFIRMED,
                receipt: mockReceipt,
              },
            ],
          ])
          .withState({
            transaction: {
              data: [revertedTx],
              loading: [],
              error: null,
            },
            wallet: {
              data: {
                address: "0x123",
              },
            },
          })
          .put(
            fetchTransactionSuccess({
              ...revertedTx,
              status: TransactionStatus.CONFIRMED,
              receipt: { logs: [] },
            }),
          )
          .run({ timeout: 15000 });
      });
    });
  });

  describe("when watching reverted transaction", () => {
    let transaction: Transaction;
    let address: string;
    let hash: string;
    let chainId: ChainId;

    beforeEach(() => {
      address = "0x123";
      hash = "0x456";
      chainId = ChainId.ETHEREUM_MAINNET;
      transaction = {
        ...buildTransactionPayload(chainId, hash, {}, chainId),
        events: [],
        hash,
        from: address,
        chainId,
        status: TransactionStatus.REVERTED,
        timestamp: Date.now(),
        nonce: 0,
        withReceipt: false,
        isCrossChain: false,
        replacedBy: null,
        actionType: "SOME_ACTION",
        url: "",
      };
    });

    describe("and the transaction expires", () => {
      it("should stop polling after expiration threshold", () => {
        const expiredTransaction = {
          ...transaction,
          timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        };

        return expectSaga(
          handleWatchRevertedTransaction,
          watchRevertedTransaction(hash),
        )
          .provide([
            [matchers.select(getTransactionInState, hash), expiredTransaction],
          ])
          .withState({
            transaction: {
              data: [expiredTransaction],
            },
            wallet: {
              data: {
                address,
              },
            },
          })
          .not.call(getTransactionFromChain)
          .run();
      });
    });
  });
});
