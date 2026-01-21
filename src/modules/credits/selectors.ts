import { isLoadingType } from "../loading/selectors";
import { FETCH_CREDITS_REQUEST } from "./actions";

export const getState = (state: any) => state.credits;

export const getData = (state: any) => getState(state).data;
export const getLoading = (state: any) => getState(state).loading;
export const getError = (state: any) => getState(state).error;
export const isFetchingCredits = (state: any): boolean =>
  isLoadingType(getLoading(state), FETCH_CREDITS_REQUEST);

export const getCredits = (state: any, address: string) =>
  getData(state)[address];
