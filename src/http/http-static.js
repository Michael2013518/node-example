const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs')
const mime = require('mime')
const server = http.createServer((req, res) => {
  let filePath = path.resolve(__dirname, path.join('www', url.fileURLToPath(`file:///${req.url}`)))
  if (fs.existsSync(filePath)) {
    const status = fs.statSync(filePath)
    const isDir = status.isDirectory()
    if (isDir) {
      filePath = path.join(filePath, 'index.html')
    }
    if (fs.existsSync(filePath)) {
      // const content = fs.readFileSync(filePath, 'utf8')
      const { ext } = path.parse(filePath)
      res.writeHead(200, { 'Content-Type': mime.getType(ext) })
      // return res.end(content)
      // 以流的方式读取文件内容
      const fileStream = fs.createReadStream(filePath)
      // pipe方法可以将两个流连接起来，数据就会从上游流向下游
      fileStream.pipe(res)
    }
  }
  res.writeHead(404, { 'Content-Type': 'text/html' })
  res.end('<h1>Not Found</h1>')
})

server.on('clientError', (err, socket) => {
  if (err) {
    return new Error(err)
  }
  socket.end('HTTP/1.1 400 Bad Request\r\n\rn')
})

server.listen(8090, () => {
  console.log('Opened server on', server.address())
})
