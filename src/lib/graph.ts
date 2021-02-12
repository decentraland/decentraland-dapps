export async function graphql<T>(
  url: string,
  query: string,
  retryDelay = 500,
  retryAttempts = 10
) {
  try {
    const result: { data: T } = await fetch(url, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query
      })
    }).then(resp => resp.json())
    if (!result || !result.data || Object.keys(result.data).length === 0) {
      throw new Error('Invalid response')
    }
    return result.data
  } catch (error) {
    // some naive retry logic
    return new Promise<T>((resolve, reject) => {
      setTimeout(
        () =>
          // duplicate delay time on each attempt if there are attempts left
          retryAttempts > 0
            ? graphql<T>(url, query, retryDelay * 2, retryAttempts - 1).then(
                result => resolve(result)
              )
            : reject(),
        retryDelay
      )
    })
  }
}
