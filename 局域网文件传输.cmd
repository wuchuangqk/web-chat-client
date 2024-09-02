@echo off
chcp 65001
echo start Node.js script...
title open-chat  

REM 初始化PID变量为空
set PID=
REM 查找使用端口1061的进程ID
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :1061') do (
    set PID=%%a
)
REM 检查是否找到进程ID
if defined PID (
    if %PID% NEQ "0" (
        echo 端口1061对应的进程ID是 %PID%
        REM 结束该进程
        taskkill /pid %PID% /f
        echo 进程已结束
    ) else (
        echo 找到的进程ID为0，可能没有使用端口1061的进程
    )
) else (
    echo 未找到使用端口1061的进程
)

REM 获取本机IP地址
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /c:"IPv4"') do (
  set IP=%%i
)
set IP=%IP:~1%
start "" "http://%IP%:1061"

REM 开启服务
node "D:\Programming\WorkSpace\Front Project\open-chat\client\server\index.js"
echo 脚本已启动。