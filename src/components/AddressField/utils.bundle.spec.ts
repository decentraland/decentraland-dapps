/**
 * @jest-environment node
 */
import path from 'path'
import { build } from 'esbuild'

// Jest loads the CommonJS builds of dependencies, while apps bundle their ESM builds. This bundles the module the way
// a browser app does and evaluates it, so code that only breaks under ESM bundling fails here.
async function bundleUtils(entryPoint = path.join(__dirname, 'utils.ts')) {
  const result = await build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    platform: 'browser',
    // Browser resolution selects ESM dependencies; CJS output lets Node evaluate the bundle.
    format: 'cjs',
    metafile: true,
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
  return { code: result.outputFiles[0].text, inputs: Object.keys(result.metafile.inputs) }
}

describe('when loading the bundled module in a browser build', () => {
  it('should evaluate without throwing and export resolveName', async () => {
    const { code } = await bundleUtils()
    const bundledModule: { exports: Record<string, unknown> } = { exports: {} }

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    expect(() => new Function('module', 'exports', code)(bundledModule, bundledModule.exports)).not.toThrow()
    expect(typeof bundledModule.exports.resolveName).toBe('function')
  })
})

describe('when importing the public ENS module directly in a browser bundle', () => {
  let code: string
  let inputs: string[]
  let bundledModule: { exports: Record<string, unknown> }

  beforeEach(async () => {
    const bundle = await bundleUtils(path.join(__dirname, '../../lib/ens.ts'))
    code = bundle.code
    inputs = bundle.inputs
    bundledModule = { exports: {} }
  })

  it('should expose address, contenthash and encoding helpers without loading UI modules', () => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    expect(() => new Function('module', 'exports', code)(bundledModule, bundledModule.exports)).not.toThrow()
    expect(typeof bundledModule.exports.resolveAddress).toBe('function')
    expect(typeof bundledModule.exports.resolveContenthash).toBe('function')
    expect(typeof bundledModule.exports.encodeENSName).toBe('function')
    expect(inputs.some(input => /node_modules\/@ethersproject\/[^/]+\/lib\.esm\//.test(input.replace(/\\/g, '/')))).toBe(true)
    expect(
      inputs.some(input =>
        /(?:^|\/)(?:src\/(?:components|containers|providers)|node_modules\/(?:react(?:-dom)?|decentraland-ui2?|@mui))(?:\/|$)/.test(
          input.replace(/\\/g, '/')
        )
      )
    ).toBe(false)
  })
})
