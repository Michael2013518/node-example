const { createServer } = require('http')
const { resolve, join, parse } = require('path')
const { statSync, existsSync, createReadStream } = require('fs')
const { fileURLToPath } = require('url')
const { getType } = require('mime')

const server = createServer((req, res) => {
  const filePath = resolve(__dirname, join('www', fileURLToPath(`file:///${req.url}`)))
  if (existsSync(filePath)) {
    const { ext } = parse(filePath)
    const stats = statSync(filePath)
    const timeStamp = req.headers['if-modified-since']
    let status = 200
    // stats.mtimeMs 文件的修改时间
    if (timeStamp && (stats.atimeMs - Number(timeStamp)) / (60 * 1000 * 60) < 2) {
      status = 304
    }
    res.writeHead(status, {
      'Content-Type': getType(ext),
      'Cache-Control': 'max-age:86400',
      'Last-Modified': stats.mtimeMs
    })
    if (status === 200) {
      const fileStream = createReadStream(filePath)
      fileStream.pipe(res)
    } else {
      res.end()
    }
  } else {
    res.writeHead(404, {
      'Content-Type': 'text/html'
    })
    res.end('<h1>Not Found</h1>')
  }
})

server.listen(8092, () => {
  console.log('Opened server on', server.address())
})
