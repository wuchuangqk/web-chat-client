import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import url from 'node:url'
import os from 'node:os'
import { exec } from 'node:child_process'

const app = express()
app.use(express.static(url.fileURLToPath(new URL('../dist', import.meta.url))))

const users = new Map()
const socketMap = new Map()

const initialPort = 4090
const startServer = (port) => {
  const server = createServer(app)
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
    maxHttpBufferSize: 1024 * 1024 * 10
  })
  io.on('connection', (socket) => {
    let onlineCount = io.engine.clientsCount
    console.log(`[${socket.id}]新用户加入，在线人数：${onlineCount}`);
    socketMap.set(socket.id, socket)

    // 用户断开连接
    socket.on('disconnect', () => {
      onlineCount = io.engine.clientsCount
      const user = users.get(socket.id)
      if (user) {
        console.log(`[${socket.id}]${user.name}断开连接，在线人数：${onlineCount}`);
      }
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
  server.listen(port, () => {
    const networks = os.networkInterfaces();
    let localIP = ''
    for (const network in networks) {
      // 只查wifi和网线的ip
      if (['WLAN'].includes(network)) {
        // IPv4和非本地地址
        const address = networks[network].find(val => val.family === 'IPv4' && !val.internal)
        if (typeof address !== 'undefined') {
          localIP = address.address
          break
        }
      }
    }
    console.log(`chat server is running at ${localIP ? localIP + ':' : ''}${port}`);
    if (localIP) {
      exec(`start "" "http://${localIP}:${port}"`)
    }
  })
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`端口 ${port} 被占用，尝试下一个端口...`);
      startServer(port + 1)
    } else if (err.code === 'EACCES') {
      console.error(`权限不足，无法使用端口 ${port}，尝试下一个端口...`);
      startServer(port + 1)
    } else {
      console.error('服务器错误:', err);
    }
  });
}

startServer(initialPort)