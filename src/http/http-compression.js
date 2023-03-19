const { resolve, join, parse } = require('path')
const { fileURLToPath } = require('url')
const { statSync, existsSync, createReadStream } = require('fs')
const { createServer } = require('http')
const { getType } = require('mime')
const zlib = require('zlib')

const server = createServer((req, res) => {
  let filePath = resolve(__dirname, join('www', fileURLToPath(`file:///${req.url}`)))
  if (existsSync(filePath)) {
    const stats = statSync(filePath)
    if (stats.isDirectory()) {
      filePath = join(filePath, 'index.html')
    }
    if (existsSync(filePath)) {
      const { ext } = parse(filePath)
      const stats = statSync(filePath)
      const timeStamp = req.headers['if-modified-since']
      let status = 200
      if (timeStamp && Number(timeStamp) === stats.mtimeMs) {
        status = 304
      }
      const responseHeaders = {
        'Content-Type': getType(ext),
        'Cache-Control': 'max-age=86400',
        'Last-Modified': stats.mtimeMs
      }
      const acceptEncoding = req.headers['accept-encoding']
      const compress = acceptEncoding && /^(text|application)\//.test(getType(ext))
      if (compress) {
        acceptEncoding.split(/\s*,\s*/).some((encoding) => {
          if (encoding === 'gzip') {
            responseHeaders['Content-Encoding'] = 'gzip'
            return true
          } else if (encoding === 'deflate') {
            responseHeaders['Content-Encoding'] = 'deflate'
            return true
          } else if (encoding === 'br') {
            responseHeaders['Content-Encoding'] = 'br'
            return true
          } else {
            return false
          }
        })
      }
      const compressionEncoding = responseHeaders['Content-Encoding']
      res.writeHead(status, responseHeaders)
      if (status === 200) {
        const fileStream = createReadStream(filePath)
        if (compress && compressionEncoding) {
          let comp
          if (compressionEncoding === 'gzip') {
            comp = zlib.createGzip()
          } else if (compressionEncoding === 'deflate') {
            comp = zlib.createDeflate()
          } else {
            comp = zlib.createBrotliCompress()
          }
          fileStream.pipe(comp).pipe(res)
        } else {
          fileStream.pipe(res)
        }
      } else {
        res.end()
      }
    }
  } else {
    res.writeHead(404, {
      'Content-Type': 'text/html'
    })
    res.end('<h1>Not Found</h1>')
  }
})

server.listen(8096, () => {
  console.log('opend server on', server.address())
})
