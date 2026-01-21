export enum TransactionEventType {
  ERROR = "error",
  SUCCESS = "success",
  PROMPT = "prompt",
  ACCEPT = "accept",
  REJECT = "reject",
}

export type TransactionEventData<T extends TransactionEventType> = {
  type: T;
} & (T extends TransactionEventType.ERROR
  ? { error: Error }
  : T extends TransactionEventType.SUCCESS
    ? { txHash: string }
    : {});
