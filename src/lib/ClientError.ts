export class ClientError extends Error {
  constructor(
    message: string,
    public status: number | undefined,
    public data: unknown
  ) {
    super(message)
  }
}
