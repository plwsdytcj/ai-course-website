#!/bin/bash

# 测试客服消息推送
# 用法：./test-customer-message.sh <用户openid>

OPENID=$1

if [ -z "$OPENID" ]; then
  echo "❌ 请提供用户 openid"
  echo "用法: ./test-customer-message.sh oXXXXXXXXXX"
  exit 1
fi

echo "📤 模拟充值并触发客服消息..."
echo ""

curl -s "https://wenkexueai.com/api/pay/test?openid=$OPENID&credits=50" | jq .

echo ""
echo "✅ 完成！请检查："
echo "1. 用户是否收到充值成功消息"
echo "2. 查看服务器日志: pm2 logs wechat-server --lines 50"
echo ""
echo "⚠️ 注意："
echo "- 用户必须在48小时内与公众号有过互动"
echo "- 如果超过48小时，消息会发送失败"

