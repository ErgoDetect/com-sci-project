
@echo off
setlocal

rem Define the port number
set port=3000

rem Get the process ID (PID) of the process listening on the specified port
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%port%') do (
    echo Killing process with PID %%a on port %port%
    taskkill /F /PID %%a
)

echo kill port 3000 already.
