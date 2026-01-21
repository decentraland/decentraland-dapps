import type { IFetchComponent } from '@well-known-components/interfaces'

/**
 * Wrapper for fetch that preserves the browser context.
 *
 * The @well-known-components/fetch-component package uses createFetchComponent()
 * which internally passes fetch as a direct reference (globalThis.fetch).
 * This causes fetch to lose its binding to the window object, resulting in
 * "TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation"
 * when executed in the browser.
 *
 * This wrapper solves the problem by maintaining the correct context.
 */
export const fetcher = {
  fetch: (url: string, init?: RequestInit) => fetch(url, init)
} as unknown as IFetchComponent
