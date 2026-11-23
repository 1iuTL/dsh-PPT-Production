import { build } from 'esbuild'

await build({
  entryPoints: ['node_modules/pptxgenjs/dist/pptxgen.es.js'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  outfile: 'vendor/pptxgen.bundle.mjs',
  external: [],
  // PptxGenJS's ESM build uses a runtime `require('fs')` for writeFile(). In an
  // ESM bundle esbuild's __require helper throws unless a real require exists.
  banner: {
    js: "import { createRequire as __dshCreateRequire } from 'node:module';\nconst require = __dshCreateRequire(import.meta.url);",
  },
  logLevel: 'info',
})
console.log('bundled vendor/pptxgen.bundle.mjs')
