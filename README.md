# web-chat-client
无需下载客户端，仅用浏览器，就能跨设备发消息、传输文件。基于socket.io，局域网下可用。

# 安装依赖&运行
- 需要node16以上版本
- 需要安装pnpm

安装依赖
```js
pnpm i
```
运行。前端端口5201，后台端口1061
```js
// 后台服务
node ./server/index.js
// 前端服务
pnpm dev
```

# 打包前端网页
```js
pnpm build
```
## 快捷启动脚本
```
修改这一行
node "D:\Programming\WorkSpace\Front Project\open-chat\client\server\index.js"
```
右键打开`局域网文件传输.cmd`
# 预览
## PC端
![](https://github.com/wuchuangqk/readme-img/blob/master/PC端1.jpg)
![](https://github.com/wuchuangqk/readme-img/blob/master/PC端2.jpg)
## 移动端
![](https://github.com/wuchuangqk/readme-img/blob/master/移动端.jpg)
