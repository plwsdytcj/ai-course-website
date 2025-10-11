#!/bin/bash

echo "🔑 测试获取微信 Access Token..."
echo ""

# 读取环境变量
source .env 2>/dev/null || true

if [ -z "$WX_APPID" ] || [ -z "$WX_APPSECRET" ]; then
  echo "❌ 缺少 AppID 或 AppSecret"
  exit 1
fi

echo "📤 请求微信API..."
RESPONSE=$(curl -s "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$WX_APPID&secret=$WX_APPSECRET")

echo "$RESPONSE" | jq .

if echo "$RESPONSE" | grep -q "access_token"; then
  echo ""
  echo "✅ 获取 Access Token 成功！"
  echo "说明 IP 白名单配置正确"
else
  echo ""
  echo "❌ 获取失败！"
  
  if echo "$RESPONSE" | grep -q "40164"; then
    echo ""
    echo "错误原因：IP 不在白名单中"
    echo "请在微信公众平台添加 IP：47.100.59.61"
  elif echo "$RESPONSE" | grep -q "40013"; then
    echo ""
    echo "错误原因：AppID 或 AppSecret 错误"
  fi
fi

