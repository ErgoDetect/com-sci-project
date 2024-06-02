@echo off

:: Function to get script directory
for %%I in ("%~dp0.") do set "script_dir=%%~fI"

:: Parse optional arguments for working directory and terminal emulator
set "working_dir=%script_dir%"
set "terminal_emulator="
:parse_args
if "%~1" == "" goto args_done
if /i "%~1" == "-w" (
    set "working_dir=%~2"
    shift
) else if /i "%~1" == "-t" (
    set "terminal_emulator=%~2"
    shift
) else (
    echo Invalid option: %1
    exit /b 1
)
shift
goto parse_args
:args_done

:: Start React app in background (consider using process management tools)
cd /d "%working_dir%" || (
    echo Unable to change directory to %working_dir%
    exit /b 1
)
echo Starting React app with yarn start...
start "" cmd /c "yarn start"
if errorlevel 1 (
    echo Error starting React app with yarn start.
    exit /b 1
)

:: Wait until http://localhost:3000/ is accessible
:wait_for_react
echo Checking if React app is ready...
timeout /t 2 >nul
powershell -command "& { try { $response = Invoke-WebRequest 'http://localhost:3000/' -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 } }"
if errorlevel 1 goto wait_for_react

:: Start Electron app in new terminal window
:: Use user-specified terminal emulator if provided
if not "%terminal_emulator%" == "" (
    start "" "%terminal_emulator%" cmd /k "cd /d "%working_dir%" && yarn dev"
) else (
    start "" cmd /k "cd /d "%working_dir%" && yarn dev"
)

exit /b 0