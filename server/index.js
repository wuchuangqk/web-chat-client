import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import url from 'node:url'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1024 * 1024 * 10
})

app.use(express.static(url.fileURLToPath(new URL('../dist', import.meta.url))))

const users = new Map()
const socketMap = new Map()

io.on('connection', (socket) => {
  let onlineCount = io.engine.clientsCount
  console.log(`[${socket.id}]新用户加入，在线人数：${onlineCount}`);
  socketMap.set(socket.id, socket)

  // 用户断开连接
  socket.on('disconnect', () => {
    onlineCount = io.engine.clientsCount
    const user = users.get(socket.id)
    console.log(`[${socket.id}]${user.name}断开连接，在线人数：${onlineCount}`);
    users.delete(socket.id)
    socket.broadcast.emit('members', Array.from(users.values()))
    socketMap.delete(socket.id)
  });

  socket.on('client:text-message', (msg) => {
    // 广播给其他人
    socket.broadcast.emit('broadcast:text-message', { id: socket.id, msg })
  })

  socket.on('bind-user-info', (user) => {
    users.set(socket.id, user)
    io.emit('members', Array.from(users.values()))
  })

  // 传输队列信息
  socket.on('tranfer-file', ({ targetId, type, data }) => {
    socketMap.get(targetId).emit('tranfer-file', {
      id: socket.id,
      type,
      data,
    })
  })
  socket.on('ack', ({ targetId }) => {
    socketMap.get(targetId).emit('ack')
  })
})

const port = 1061
server.listen(port, () => {
  console.log(`chat server is running at ${port}`);
})