const net = require('net')

function responseData(str, status = 200, desc = 'OK') {
  return `
   HTTP/1.1 ${status} ${desc}
   Connection: keep-alive
   Date: ${new Date()}
   Content-length: ${str.length}
   Content-Type: text/html

   ${str}
  `
}
const server = net.createServer(socket => {
  socket.on('data', data => {
    // data.toString() 将buffer转换为字符串
    const matched = data.toString().match(/^GET ([/\w]+) HTTP/)
    if (matched) {
      const path = matched[1]
      if (path === '/') {
        socket.write(responseData('<h1>Hello World</h1>'))
      } else {
        socket.write(responseData('<h1>Not Found</h1>', 404, 'NOT FOUND'))
      }
    }
    console.log(`DATA:\n\n${data}`)
  })
  socket.on('close', () => {
    console.log('connection closed, Goodbye \n\n\n')
  })
}).on('error', err => {
  throw new Error(err)
})

server.listen({
  host: '0.0.0.0',
  port: 8088
}, () => {
  console.log('opened server on', server.address())
})
