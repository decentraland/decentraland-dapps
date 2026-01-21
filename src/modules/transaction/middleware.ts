import { RootMiddleware } from "../../types";
import { getAddress } from "../wallet/selectors";
import { fetchTransactionRequest } from "./actions";
import {
  getTransactionAddressFromAction,
  getTransactionHashFromAction,
  isTransactionAction,
} from "./utils";

export const createTransactionMiddleware = () => {
  const middleware: RootMiddleware = (store) => (next) => (action) => {
    if (isTransactionAction(action)) {
      const address =
        getTransactionAddressFromAction(action) || getAddress(store.getState());
      const transactionHash = getTransactionHashFromAction(action);

      if (address) {
        store.dispatch(
          fetchTransactionRequest(address, transactionHash, action),
        );
      }
    }

    return next(action);
  };

  return middleware;
};
