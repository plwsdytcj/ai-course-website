#!/bin/bash

echo "🔄 重启微信服务..."
echo ""

# 零停机重启
pm2 reload wechat-server

echo ""
echo "✅ 重启完成！"
echo ""

# 查看状态
pm2 status

echo ""
echo "📊 查看日志："
echo "   pm2 logs wechat-server"

