// jsdom does not implement `fetch` or the related web streaming/body globals.
// Instead of polyfilling them with `node-fetch`, this environment copies Node's
// own native (undici) implementations into the jsdom global, so tests run
// against the same `fetch` the library uses in production. nock >= 14 is able to
// intercept this native `fetch`.
const JSDOMEnvModule = require('jest-environment-jsdom')
const JSDOMEnvironment =
  JSDOMEnvModule.default || JSDOMEnvModule.TestEnvironment || JSDOMEnvModule

const NATIVE_GLOBALS = [
  'fetch',
  'Headers',
  'Request',
  'Response',
  'FormData',
  'Blob',
  'File',
  'ReadableStream',
  'WritableStream',
  'TransformStream',
  'AbortController',
  'AbortSignal',
  'structuredClone',
  // Needed by nock's @mswjs/interceptors, which references them at import time.
  'TextEncoder',
  'TextDecoder',
  'MessageChannel',
  'MessagePort',
  'BroadcastChannel',
]

class JsdomNativeFetchEnvironment extends JSDOMEnvironment {
  // jsdom defaults the package `exports` resolution to the `browser` condition.
  // nock >= 14 resolves `@mswjs/interceptors/presets/node`, whose `node`
  // condition must be active, so add it while keeping the browser default.
  exportConditions() {
    const base =
      typeof super.exportConditions === 'function'
        ? super.exportConditions()
        : []
    return Array.from(new Set([...base, 'node']))
  }

  async setup() {
    await super.setup()
    for (const name of NATIVE_GLOBALS) {
      if (
        this.global[name] === undefined &&
        typeof globalThis[name] !== 'undefined'
      ) {
        this.global[name] = globalThis[name]
      }
    }
  }
}

module.exports = JsdomNativeFetchEnvironment
