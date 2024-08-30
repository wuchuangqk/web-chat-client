@echo off
echo start Node.js script...
title open-chat  
REM 开启服务
node "D:\Programming\WorkSpace\Front Project\open-chat\client\server\index.js"
REM 获取本机IP地址
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /c:"IPv4"') do set IP=%%i
set IP=%IP:~1%
start "" "http://%IP%:1061"
echo 脚本已启动。