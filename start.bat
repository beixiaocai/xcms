@echo off
setlocal
chcp 65001

tasklist | findstr /i "xcms.exe" >nul
if errorlevel 1 (
    echo xcms.exe is not running
) else (
    echo xcms.exe is running
	
	taskkill /IM xcms.exe /F
)


tasklist | findstr /i "xcms_admin.exe" >nul
if errorlevel 1 (
    echo xcms_admin.exe is not running
) else (
    echo xcms_admin.exe is running
	taskkill /IM xcms_admin.exe /F
)

tasklist | findstr /i "xcms_assistant.exe" >nul
if errorlevel 1 (
    echo xcms_assistant.exe is not running
) else (
    echo xcms_assistant.exe is running
	taskkill /IM xcms_assistant.exe /F
)

tasklist | findstr /i "xcms_core.exe" >nul
if errorlevel 1 (
    echo xcms_core.exe is not running
) else (
    echo xcms_core.exe is running
	taskkill /IM xcms_core.exe /F
)

tasklist | findstr /i "xcms_zlm.exe" >nul
if errorlevel 1 (
    echo xcms_zlm.exe is not running
) else (
    echo xcms_zlm.exe is running
	taskkill /IM xcms_zlm.exe /F
)

tasklist | findstr /i "xcms_media.exe" >nul
if errorlevel 1 (
    echo xcms_media.exe is not running
) else (
    echo xcms_media.exe is running
	taskkill /IM xcms_media.exe /F
)


xcms.exe

endlocal
