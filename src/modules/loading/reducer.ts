import { AnyAction } from "redux";
import { getStatus, getType, removeLast } from "./utils";

export type LoadingState = AnyAction[];

export const INITIAL_STATE: LoadingState = [];

export function loadingReducer(
  state: LoadingState = INITIAL_STATE,
  action: AnyAction,
): LoadingState {
  const type = getType(action); // ie. "Fetch Address Parcels"
  const status = getStatus(action); // REQUEST, SUCCESS, FAILURE

  switch (status) {
    case "REQUEST": {
      return [...state, action];
    }
    case "FAILURE":
    case "SUCCESS":
    case "CLEAR": {
      return removeLast(state, (actionItem) => getType(actionItem) === type);
    }
    default:
      return state;
  }
}
