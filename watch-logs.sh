#!/bin/bash

echo "📊 实时查看服务器日志..."
echo "按 Ctrl+C 退出"
echo ""
echo "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" 
echo ""

pm2 logs wechat-server --lines 50

