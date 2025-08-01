# AI课程网站部署指南

## 项目概述
这是一个专为文科生设计的AI入门课程网站，使用 React + Vite + Tailwind CSS 构建。

## 部署前准备

### 1. 阿里云服务器准备
- 购买阿里云 ECS 实例
- 推荐配置：2核4GB内存，40GB存储
- 操作系统：Ubuntu 20.04 LTS 或 CentOS 7+

### 2. 域名准备（可选）
- 购买域名（如：aicourse.com）
- 在阿里云控制台配置域名解析

## 部署步骤

### 步骤1：构建项目
```bash
# 在本地项目目录执行
pnpm build
```

### 步骤2：上传文件到服务器

#### 方法1：使用 SCP 命令
```bash
# 将 dist 目录上传到服务器
scp -r dist/* root@你的服务器IP:/var/www/html/
```

#### 方法2：使用 SFTP 工具
- 使用 FileZilla、WinSCP 等工具
- 连接服务器：`sftp root@你的服务器IP`
- 上传 `dist/` 目录中的所有文件到 `/var/www/html/`

### 步骤3：配置 Nginx 服务器

#### 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 配置 Nginx
创建配置文件：
```bash
sudo nano /etc/nginx/sites-available/ai-course
```

添加以下配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或服务器IP
    
    root /var/www/html;
    index index.html;
    
    # 处理 React Router 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

启用站点：
```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/ai-course /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# CentOS/RHEL
sudo cp /etc/nginx/sites-available/ai-course /etc/nginx/conf.d/
sudo nginx -t
sudo systemctl restart nginx
```

### 步骤4：配置防火墙
```bash
# Ubuntu/Debian
sudo ufw allow 80
sudo ufw allow 443

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 步骤5：配置 HTTPS（推荐）

#### 使用 Let's Encrypt 免费证书
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

## 服务器维护

### 更新网站
```bash
# 1. 在本地重新构建
pnpm build

# 2. 上传新文件
scp -r dist/* root@服务器IP:/var/www/html/

# 3. 重启 Nginx（如果需要）
sudo systemctl restart nginx
```

### 查看日志
```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 性能优化
```bash
# 启用 Gzip 压缩
sudo nano /etc/nginx/nginx.conf
# 在 http 块中添加：
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## 故障排除

### 常见问题

1. **网站无法访问**
   - 检查防火墙设置
   - 确认 Nginx 服务运行状态：`sudo systemctl status nginx`
   - 检查端口是否开放：`netstat -tlnp | grep :80`

2. **静态资源 404**
   - 确认文件权限：`sudo chown -R www-data:www-data /var/www/html/`
   - 检查文件路径是否正确

3. **路由问题**
   - 确认 Nginx 配置中的 `try_files` 指令正确

### 性能监控
```bash
# 安装监控工具
sudo apt install htop iotop

# 查看系统资源使用
htop
```

## 安全建议

1. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

2. **配置防火墙**
   ```bash
   sudo ufw enable
   sudo ufw default deny incoming
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. **禁用 root 登录**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # 设置：PermitRootLogin no
   sudo systemctl restart ssh
   ```

## 备份策略

### 自动备份脚本
```bash
#!/bin/bash
# 创建备份脚本 backup.sh
BACKUP_DIR="/backup/website"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/website_backup_$DATE.tar.gz /var/www/html/

# 保留最近7天的备份
find $BACKUP_DIR -name "website_backup_*.tar.gz" -mtime +7 -delete
```

## 联系支持

如果遇到部署问题，请检查：
1. 服务器日志：`/var/log/nginx/error.log`
2. 系统日志：`journalctl -u nginx`
3. 网络连接：`ping your-domain.com`

---

**部署完成后，你的 AI 课程网站就可以通过 `http://你的域名` 或 `http://你的服务器IP` 访问了！** 