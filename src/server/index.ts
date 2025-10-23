import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import os from 'node:os'
import {Event} from '../common'

const app = express()

const users = new Map()
const socketMap = new Map()

const initialPort = 4090
const startServer = (port: number) => {
  const server = createServer(app)
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
    maxHttpBufferSize: 1024 * 1024 * 10
  })
  // 一个新连接进来
  io.on('connection', (socket) => {
    console.log(`new connection, socket.id: ${socket.id}`);
    
    let onlineCount = io.engine.clientsCount
    // console.log(`[${socket.id}]新用户加入，在线人数：${onlineCount}`);

    // 判断房间人数是否满员
    const mainRoomSize = io.of('main-room').sockets.size
    // console.log(`主房间人数: ${mainRoomSize}`);
    // if (mainRoomSize > 2) {
    //   socket.emit('room-full')
    //   socket.disconnect(true)
    //   return
    // }

    // 加入到主房间
    // console.log(`[${socket.id}]加入主房间`);
    // socket.join('main-room')
    // socketMap.set(socket.id, socket)

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`socket.id: ${socket.id} disconnect`);
      // onlineCount = io.engine.clientsCount
      // 看这个socket有没有关联的用户
      const user = users.get(socket.id)
      if (user) {
        // console.log(`[${socket.id}]${user.name}断开连接，在线人数剩余：${onlineCount}`);
        socket.to('main-room').emit('broadcast:notify-message', { msg: `${user.name}离开房间` })
        users.delete(socket.id)
        socket.to('main-room').emit(Event.MemberLeave, user)
      }
      // socket.to('main-room').emit('members', Array.from(users.values()))
      // socketMap.delete(socket.id)
    });

    socket.on('client:text-message', (msg) => {
      // 广播给其他人
      socket.to('main-room').emit('broadcast:text-message', { id: socket.id, msg })
    })

    socket.on('bind-user-info', (user) => {
      users.set(socket.id, user)
      io.to('main-room').emit('members', Array.from(users.values()))
      socket.to('main-room').emit('broadcast:notify-message', { msg: `${user.name}加入连接` })
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
    socket.on('receiver-responses', ({ targetId, type }) => {
      socketMap.get(targetId).emit('receiver-responses', {
        type,
      })
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