const esbuild = require('esbuild')

const options = {
  entryPoints: ['src/jcode-tools/index.js'],
  outfile: 'dist/jcode-tools.js',
  bundle: true,
  format: 'esm'
  // globalName: 'JCode'
}

if (process.env.mode === 'production') {
  esbuild.buildSync({
    ...options,
    format: 'iife',
    globalName: 'JCode',
    minify: true,
    inject: ['./src/jcode-tools/inject-iife.js']
  })
  esbuild.buildSync({
    ...options,
    outfile: 'dist/jcode-tools.esm.js',
    inject: ['./src/jcode-tools/inject-esm.js'],
    loader: {
      '.css': 'text'
    }
  })
} else {
  esbuild.context({
    ...options,
    outfile: 'examples/dist/jcode-tools.esm.js',
    inject: ['./src/jcode-tools/inject-esm.js'],
    loader: {
      '.css': 'text'
    }
  }).then(ctx => {
    ctx.serve({
      servedir: 'examples',
      host: 'localhost',
      port: 8090
    }).then(server => {
      console.log(`Server is running at ${server.host}:${server.port}`)
    })
  })
}
