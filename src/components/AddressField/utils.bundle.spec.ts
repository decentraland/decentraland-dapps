/**
 * @jest-environment node
 */
import path from 'path'
import { build } from 'esbuild'

// Jest loads the CommonJS builds of dependencies, while apps bundle their ESM builds. This bundles the module the way
// a browser app does and evaluates it, so code that only breaks under ESM bundling fails here.
async function bundleUtils() {
  const result = await build({
    entryPoints: [path.join(__dirname, 'utils.ts')],
    bundle: true,
    write: false,
    platform: 'browser',
    format: 'cjs',
    logLevel: 'silent',
    plugins: [
      {
        name: 'stub-app-modules',
        setup(pluginBuild) {
          pluginBuild.onResolve({ filter: /\/(lib\/eth|modules\/analytics\/utils)$/ }, args => ({ path: args.path, namespace: 'stub' }))
          pluginBuild.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
            contents:
              'export const _getAppChainId = () => 1; export const getENSWeb3Provider = async () => ({}); export const getAnalytics = () => undefined',
            loader: 'js'
          }))
        }
      }
    ]
  })
  return result.outputFiles[0].text
}

describe('when loading the bundled module in a browser build', () => {
  it('should evaluate without throwing and export resolveName', async () => {
    const code = await bundleUtils()
    const bundledModule: { exports: Record<string, unknown> } = { exports: {} }

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    expect(() => new Function('module', 'exports', code)(bundledModule, bundledModule.exports)).not.toThrow()
    expect(typeof bundledModule.exports.resolveName).toBe('function')
  })
})
