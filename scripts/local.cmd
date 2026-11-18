@echo off
rem Windows launcher: double-click, or run  scripts\local.cmd [dev|prod|check] [port]
node "%~dp0local.mjs" %*
if errorlevel 1 pause
