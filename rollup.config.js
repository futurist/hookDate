// rollup.config.js

import minify from 'rollup-plugin-minify'

export default {
  entry: './src/index.js',
  moduleName: 'hookdate',
  plugins:[
    minify({iife: 'dist/hookdate.min.js'})
  ],
  targets: [
    { format: 'es',   dest: 'dist/hookdate.es.js'   },
    { format: 'cjs',  dest: 'dist/hookdate.cjs.js'  },
    { format: 'amd',  dest: 'dist/hookdate.amd.js'  },
    { format: 'iife', dest: 'dist/hookdate.iife.js' },
  ]
}
