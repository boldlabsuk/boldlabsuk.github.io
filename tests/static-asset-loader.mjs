import { registerHooks } from 'node:module'

const staticAssetPattern = /\.(jpe?g|png|svg|webp)$/i

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (staticAssetPattern.test(specifier)) {
      return {
        format: 'module',
        shortCircuit: true,
        url: new URL(specifier, context.parentURL).href,
      }
    }

    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (staticAssetPattern.test(url)) {
      return {
        format: 'module',
        shortCircuit: true,
        source: `export default ${JSON.stringify(url)};`,
      }
    }

    return nextLoad(url, context)
  },
})
