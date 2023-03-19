const { createServer } = require('http')
const { URL } = require('url')
const { existsSync, createReadStream } = require('fs')
const { file } = require('checksum')
const mime = require('mime')

function getMimeType(res) {
  const EXT_MIME_TYPES = mime.types
  const path = require('path')
  const mimeType = EXT_MIME_TYPES[path.extname(res).slice(1) || 'html']
  return mimeType
}

const server = createServer((req, res) => {
  const srvUrl = new URL(`http://${req.url}`)
  let path = srvUrl.pathname
  if (path === '/') {
    path = '/index.html'
  }
  const resPath = `resource${path}`
  if (!existsSync(resPath)) {
    res.writeHead(404, {
      'Content-Type': 'text/html'
    })
    return res.end('<h1>404 Not Found</h1>')
  }

  file(resPath, (err, sum) => {
    if (err) {
      return new Error(err)
    }
    const resStream = createReadStream(resPath)
    sum = `"${sum}"`

    if (req.headers['if-none-match'] === sum) {
      res.writeHead(304, {
        'Content-Type': getMimeType(resPath),
        etag: sum
      })
      res.end()
    } else {
      res.writeHead(200, {
        'Content-Type': getMimeType(res.resPath),
        etag: sum
      })
      resStream.pipe(res)
    }
  })
})

server.on('clientError', (err, socket) => {
  if (err) {
    return new Error(err)
  }
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

server.listen(8095, () => {
  console.log('opend server on', server.address())
})
