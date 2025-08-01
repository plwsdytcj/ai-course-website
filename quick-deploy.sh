#!/bin/bash

# AI课程网站快速部署脚本
# 使用方法: ./quick-deploy.sh 服务器IP 域名

if [ $# -lt 1 ]; then
    echo "使用方法: $0 服务器IP [域名]"
    echo "示例: $0 123.456.789.012"
    echo "示例: $0 123.456.789.012 aicourse.com"
    exit 1
fi

SERVER_IP=$1
DOMAIN=${2:-$SERVER_IP}

echo "🚀 开始部署 AI 课程网站到 $SERVER_IP"
echo "🌐 域名: $DOMAIN"

# 构建项目
echo "📦 构建生产版本..."
pnpm build

if [ ! -d "dist" ]; then
    echo "❌ 构建失败！"
    exit 1
fi

echo "✅ 构建成功！"

# 创建临时部署包
echo "📦 创建部署包..."
tar -czf ai-course-deploy.tar.gz -C dist .

# 上传到服务器
echo "📤 上传文件到服务器..."
scp ai-course-deploy.tar.gz root@$SERVER_IP:/tmp/

# 在服务器上执行部署
echo "🔧 在服务器上配置..."
ssh root@$SERVER_IP << EOF
# 更新系统
apt update -y

# 安装 Nginx
apt install nginx -y

# 解压文件
cd /tmp
tar -xzf ai-course-deploy.tar.gz -C /var/www/html/

# 设置权限
chown -R www-data:www-data /var/www/html/
chmod -R 755 /var/www/html/

# 创建 Nginx 配置
cat > /etc/nginx/sites-available/ai-course << 'NGINX'
server {
    listen 80;
    server_name $DOMAIN;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
NGINX

# 启用站点
ln -sf /etc/nginx/sites-available/ai-course /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx

# 配置防火墙
ufw allow 80
ufw allow 443
ufw allow 22

# 清理临时文件
rm -f /tmp/ai-course-deploy.tar.gz

echo "✅ 部署完成！"
echo "🌐 网站地址: http://$DOMAIN"
EOF

# 清理本地临时文件
rm -f ai-course-deploy.tar.gz

echo ""
echo "🎉 部署完成！"
echo "🌐 网站地址: http://$DOMAIN"
echo ""
echo "📋 后续步骤："
echo "1. 配置域名解析（如果有域名）"
echo "2. 配置 HTTPS 证书"
echo "3. 设置监控和备份"
echo ""
echo "📖 详细说明请查看 DEPLOYMENT.md" 