import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import os from 'node:os'
import { Event, Room } from '../common/enums/index.ts'
import type { IUser } from '../common/types/index.d.ts'

const app = express()

// 存储所有注册的用户
const users = new Map<string, IUser>()
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

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`socket.id: ${socket.id} disconnect`);
      // 看这个socket有没有关联的用户
      const user = users.get(socket.id)
      if (user) {
        socket.to(Room.Main).emit('broadcast:notify-message', { msg: `${user.name}离开房间` })
        users.delete(socket.id)
        socket.to(Room.Main).emit(Event.MemberLeave, user)
      }
    });

    socket.on(Event.TextMessage, (msg) => {
      // 广播给其他人
      const user = users.get(socket.id)
      socket.to(Room.Main).emit(Event.TextMessage, { userId: user!.id, msg })
    })

    socket.on(Event.JoinRoom, (data: IUser) => {
      // 加入房间的同时进行注册,将用户与socket.id关联
      users.set(socket.id, data)
      socket.join(Room.Main)
      console.log(`${data.name}加入主方间`);
      // 通知其他人我进来了
      socket.to(Room.Main).emit(Event.NewMember, data)
    })

    socket.on('bind-user-info', (user) => {
      users.set(socket.id, user)
      io.to(Room.Main).emit('members', Array.from(users.values()))
      socket.to(Room.Main).emit('broadcast:notify-message', { msg: `${user.name}加入连接` })
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
  server.on('error', (err: any) => {
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