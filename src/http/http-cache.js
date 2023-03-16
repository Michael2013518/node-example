// 强缓缓存，协商缓存
const http = require('http')
const path = require('path')
const { fileURLToPath } = require('url')
const fs = require('fs')
const mime = require('mime')
const server = http.createServer((req, res) => {
  let filePath = path.resolve(__dirname, path.join('www', fileURLToPath(`file:///${req.url}`)))
  if (fs.existsSync(filePath)) {
    const status = fs.statSync(filePath)
    if (status.isDirectory()) {
      filePath = path.join(filePath, 'index.html')
    }
    if (fs.existsSync(filePath)) {
      const { ext } = path.parse(filePath)
      res.writeHead(200, {
        'Content-Type': mime.getType(ext),
        'Cache-Control': 'max-age=86400'
      })
      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('<h1>Not Found</h1>')
  }
})

server.listen(8091, () => {
  console.log('Opened server on', server.address())
})
