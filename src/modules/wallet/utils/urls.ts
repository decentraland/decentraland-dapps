let TRANSACTIONS_API_URL = 'https://transactions-api.decentraland.co/v1'
export const getTransactionsApiUrl = () => TRANSACTIONS_API_URL
export const setTransactionsApiUrl = (url: string) =>
  (TRANSACTIONS_API_URL = url)