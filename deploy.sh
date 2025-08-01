#!/bin/bash

# AI课程网站部署脚本
echo "🚀 开始部署 AI 课程网站到阿里云服务器..."

# 构建项目
echo "📦 构建生产版本..."
pnpm build

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建成功！"
echo "📁 构建文件位置: ./dist/"
echo ""
echo "📋 部署步骤："
echo "1. 将 dist/ 目录中的所有文件上传到阿里云服务器"
echo "2. 配置 Nginx 或 Apache 服务器"
echo "3. 设置域名解析"
echo ""
echo "🔧 服务器配置建议："
echo "- 操作系统: Ubuntu 20.04+ 或 CentOS 7+"
echo "- Web服务器: Nginx (推荐) 或 Apache"
echo "- 内存: 至少 1GB"
echo "- 存储: 至少 10GB"
echo ""
echo "📝 详细部署说明请查看 DEPLOYMENT.md" 