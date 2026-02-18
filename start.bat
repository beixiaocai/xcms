@echo off
setlocal
chcp 65001

tasklist | findstr /i "rebekah.exe" >nul
if errorlevel 1 (
    echo rebekah.exe is not running
) else (
    echo rebekah.exe is running
	
	taskkill /IM rebekah.exe /F
)


tasklist | findstr /i "rebekah_admin.exe" >nul
if errorlevel 1 (
    echo rebekah_admin.exe is not running
) else (
    echo rebekah_admin.exe is running
	taskkill /IM rebekah_admin.exe /F
)


tasklist | findstr /i "rebekah_core.exe" >nul
if errorlevel 1 (
    echo rebekah_core.exe is not running
) else (
    echo rebekah_core.exe is running
	taskkill /IM rebekah_core.exe /F
)

tasklist | findstr /i "rebekah_zlm.exe" >nul
if errorlevel 1 (
    echo rebekah_zlm.exe is not running
) else (
    echo rebekah_zlm.exe is running
	taskkill /IM rebekah_zlm.exe /F
)

tasklist | findstr /i "rebekah_media.exe" >nul
if errorlevel 1 (
    echo rebekah_media.exe is not running
) else (
    echo rebekah_media.exe is running
	taskkill /IM rebekah_media.exe /F
)


rebekah.exe

endlocal
