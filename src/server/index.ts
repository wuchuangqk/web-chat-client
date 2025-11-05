import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import os from 'node:os'
import { Event, Room } from '../common/enums/index.ts'
import type { IUser } from '../common/types/index.d.ts'

const app = express()

// 记录在房间里的用户
const members = new Map<string, IUser>()
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
    console.log(`new connection, socket.id: ${socket.id}, 在线人数：${io.engine.clientsCount}`);

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`socket.id: ${socket.id} disconnect, 在线人数：${io.engine.clientsCount}`);
      // 看这个socket有没有加入到房间里
      const user = members.get(socket.id)
      if (user) {
        // socket.to(Room.Main).emit('broadcast:notify-message', { msg: `${user.name}离开房间` })
        socket.to(Room.Main).emit(Event.MemberLeave, user)
        members.delete(socket.id)
      }
    });

    socket.on(Event.TextMessage, (msg) => {
      console.log('TextMessage', msg);
      // 广播给其他人
      const user = members.get(socket.id)
      socket.to(Room.Main).emit(Event.TextMessage, { userId: user.socketId, msg })
    })

    // 用户申请加入房间
    socket.on(Event.JoinRoom, (user: IUser) => {
      // 让用户去主房间
      socket.join(Room.Main)

      // 通知其他人有新用户进来
      socket.to(Room.Main).emit(Event.NewMember, user)

      // 把房间里其他成员信息同步给用户
      socket.emit(Event.MembersList, Array.from(members.values()))

      // 记录下用户信息
      members.set(socket.id, user)
    })

    socket.on('bind-user-info', (user) => {
      members.set(socket.id, user)
      io.to(Room.Main).emit('members', Array.from(members.values()))
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