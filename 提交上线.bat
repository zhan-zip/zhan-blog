@echo off
chcp 65001 >nul
title 一键提交上线
cd /d %~dp0

echo ================================
echo    一键提交上线（zhan-blog）
echo ================================
echo.

echo [1/4] 拉取远程最新（同步后台改动）...
git pull origin main
if errorlevel 1 (
    echo.
    echo [错误] 拉取失败，可能有冲突。请手动处理：git status
    pause
    exit /b
)

echo [2/4] 提交本地所有修改...
git add -A
git commit -m "内容更新：%date:~0,10% %time:~0,8%"

echo [3/4] 推送到 GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo [错误] 推送失败，请检查网络/梯子后重试。
    pause
    exit /b
)

echo [4/4] 完成！
echo.
echo ✓ 已提交并推送到线上，约 2 分钟后生效（GitHub Pages 部署）。
echo.
pause
