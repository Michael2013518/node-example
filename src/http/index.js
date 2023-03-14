// http模块
const http = require('http')
const url = require('url')

const responseData = {
  ID: 'Michael',
  Name: '迈克尔',
  RegisterDate: '2020年3月1日'
}
function toHTML(data) {
  return `
  <ul>
    <li><span>账号：</span><span>${data.ID}</span></li>
    <li><span>昵称：</span><span>${data.Name}</span></li>
      <li><span>注册时间：</span><span>${data.RegisterDate}</span></li>
  </ul>
  `
}
const server = http.createServer((req, res) => {
  const { pathname } = new url.URL(`http://${req.headers.host}${req.url}`)
  if (pathname === '/') {
    const accept = req.headers.accept
    if (req.method === 'POST' || accept.indexOf('application/json') > 0) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(responseData))
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
      res.end(toHTML(responseData))
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('<h1>Not Found</h1>')
  }
})

server.on('clientError', (err, socket) => {
  if (err) {
    console.log(err)
  }
  socket.end('HTTP/1.1 400 Bad Request \r\n\r\n')
})

server.listen(8088, () => {
  console.log('opened server on', server.address())
})
