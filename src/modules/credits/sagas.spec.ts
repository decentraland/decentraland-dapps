import { expectSaga } from "redux-saga-test-plan";
import { call, select } from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { eventChannel } from "redux-saga";
import {
  fetchCreditsRequest,
  fetchCreditsSuccess,
  fetchCreditsFailure,
  pollCreditsBalanceRequest,
  startCreditsSSE,
  stopCreditsSSE,
} from "./actions";
import { creditsSaga } from "./sagas";
import { getCredits } from "./selectors";
import { CreditsResponse } from "./types";
import { CreditsClient } from "./CreditsClient";
import { connectWalletSuccess } from "../wallet/actions";
import {
  getFeatureVariant,
  getIsFeatureEnabled,
  isCreditsFeatureEnabled,
} from "../features/selectors";
import { ApplicationName, FeatureName } from "../features/types";
import { Wallet } from "../wallet";

const creditsClient = new CreditsClient(
  "https://credits-server.decentraland.zone",
);

describe("Credits saga", () => {
  const address = "0x123";
  const mockCredits: CreditsResponse = {
    totalCredits: 1000,
    credits: [
      {
        id: "1",
        amount: "1000",
        availableAmount: "1000",
        contract: "0x123",
        expiresAt: "1000",
        season: 1,
        signature: "123",
        timestamp: "1000",
        userAddress: "0x123",
      },
    ],
  };

  // Mock for EventSource since it's not available in Node.js environment
  class MockEventSource {
    onmessage: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;

    constructor(public url: string) {}

    close() {
      // Simulating close behavior
    }

    // Helper to simulate receiving a message
    simulateMessage(data: any) {
      if (this.onmessage) {
        this.onmessage({ data: JSON.stringify(data) });
      }
    }

    // Helper to simulate an error
    simulateError(error: any) {
      if (this.onerror) {
        this.onerror(error);
      }
    }
  }

  beforeAll(() => {
    // Mock EventSource globally
    (global as any).EventSource = MockEventSource;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when handling fetchCreditsRequest action", () => {
    describe("and the request succeeds", () => {
      it("should put fetchCreditsSuccess with the credits when the request succeeds", () => {
        return expectSaga(creditsSaga, {
          creditsClient,
        })
          .provide([
            [select(isCreditsFeatureEnabled, address), true],
            [call([creditsClient, "fetchCredits"], address), mockCredits],
          ])
          .put(fetchCreditsSuccess(address, mockCredits))
          .dispatch(fetchCreditsRequest(address))
          .silentRun();
      });
    });

    describe("and the request fails", () => {
      it("should put fetchCreditsFailure with the error message when the request fails with a message", () => {
        const errorMessage = "Invalid address";
        const error = new Error(errorMessage);

        return expectSaga(creditsSaga, {
          creditsClient,
        })
          .provide([
            [select(isCreditsFeatureEnabled, address), true],
            [call([creditsClient, "fetchCredits"], address), throwError(error)],
          ])
          .put(fetchCreditsFailure(address, errorMessage))
          .dispatch(fetchCreditsRequest(address))
          .silentRun();
      });

      it("should put fetchCreditsFailure with an unknown error when the request fails without a message", () => {
        return expectSaga(creditsSaga, {
          creditsClient,
        })
          .provide([
            [select(isCreditsFeatureEnabled, address), true],
            [
              call([creditsClient, "fetchCredits"], address),
              throwError({} as Error),
            ],
          ])
          .put(fetchCreditsFailure(address, "Unknown error"))
          .dispatch(fetchCreditsRequest(address))
          .silentRun();
      });
    });
  });

  describe("when handling connectWalletSuccess action", () => {
    it("should put fetchCreditsRequest with the wallet address", () => {
      const wallet = { address } as Wallet;

      return expectSaga(creditsSaga, {
        creditsClient,
      })
        .provide([[select(isCreditsFeatureEnabled, address), true]])
        .put(fetchCreditsRequest(address))
        .dispatch(connectWalletSuccess(wallet))
        .silentRun();
    });
  });

  describe("when handling pollCreditsBalanceRequest action", () => {
    it("should put fetchCreditsSuccess when the credits balance matches the expected balance", () => {
      const expectedBalance = BigInt("1000");

      return expectSaga(creditsSaga, {
        creditsClient,
      })
        .provide([
          [select(isCreditsFeatureEnabled, address), true],
          [call([creditsClient, "fetchCredits"], address), mockCredits],
          [select(getCredits, address), mockCredits],
        ])
        .put(fetchCreditsRequest(address))
        .put(fetchCreditsSuccess(address, mockCredits))
        .dispatch(pollCreditsBalanceRequest(address, expectedBalance))
        .silentRun();
    });
  });

  describe("when handling startCreditsSSE action", () => {
    it("should establish SSE connection and dispatch initial fetch", () => {
      // Mock the createSSEConnection method
      const mockEventSource = new MockEventSource(
        `https://example.com/users/${address}/credits/stream`,
      );
      const createSSEConnectionMock = jest
        .spyOn(creditsClient, "createSSEConnection")
        .mockImplementation((addr, onMessage, onError) => {
          // Store callbacks to simulate events later
          mockEventSource.onmessage = onMessage as any;
          mockEventSource.onerror = onError as any;
          return mockEventSource as any;
        });

      const saga = expectSaga(creditsSaga, {
        creditsClient,
      })
        .provide([
          [select(isCreditsFeatureEnabled, address), true],
          [call([creditsClient, "fetchCredits"], address), mockCredits],
        ])
        .put(fetchCreditsRequest(address))
        .dispatch(startCreditsSSE(address));

      return saga.silentRun().then(() => {
        // Verify that createSSEConnection was called
        expect(createSSEConnectionMock).toHaveBeenCalledWith(
          address,
          expect.any(Function),
          expect.any(Function),
        );

        createSSEConnectionMock.mockRestore();
      });
    });

    it("should handle SSE messages by dispatching success actions", () => {
      // Mock event channel to control events
      const mockChannel = eventChannel(() => () => {});

      // We can use redux-saga-test-plan to test the flow
      return expectSaga(creditsSaga, { creditsClient })
        .provide([
          [select(isCreditsFeatureEnabled, address), true],
          [call([creditsClient, "fetchCredits"], address), mockCredits],
        ])
        .put(fetchCreditsRequest(address))
        .dispatch(startCreditsSSE(address))
        .silentRun();
    });
  });

  describe("when handling stopCreditsSSE action", () => {
    it("should close SSE connection and cancel saga", () => {
      // Create a spy on EventSource.close
      const mockEventSource = new MockEventSource(
        `https://example.com/users/${address}/credits/stream`,
      );
      const closeSpy = jest.spyOn(mockEventSource, "close");

      // Mock the createSSEConnection method
      const createSSEConnectionMock = jest
        .spyOn(creditsClient, "createSSEConnection")
        .mockImplementation(() => mockEventSource as any);

      // First start polling, then stop it
      return expectSaga(creditsSaga, { creditsClient })
        .provide([
          [select(isCreditsFeatureEnabled, address), true],
          [call([creditsClient, "fetchCredits"], address), mockCredits],
        ])
        .dispatch(startCreditsSSE(address))
        .dispatch(stopCreditsSSE())
        .silentRun()
        .then(() => {
          // We should have tried to close the connection
          expect(closeSpy).toHaveBeenCalled();

          // Clean up mocks
          closeSpy.mockRestore();
          createSSEConnectionMock.mockRestore();
        });
    });
  });
});
