#!/bin/bash
# ============================================================
# 服务器初始化脚本（首次部署时执行一次）
# 适用于 Ubuntu 22.04 / Debian 12
# ============================================================
set -e

echo "🔧 安装 Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "🔧 安装 pnpm..."
npm install -g pnpm

echo "🔧 安装 PM2..."
npm install -g pm2
pm2 startup  # 生成开机自启命令，按提示执行

echo "🔧 安装 Nginx..."
sudo apt-get install -y nginx

echo "🔧 配置 Nginx..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/blog
sudo ln -sf /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/blog
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "🔧 创建 web 目录..."
sudo mkdir -p /var/www/blog
sudo chown -R $USER:$USER /var/www/blog

echo ""
echo "✅ 服务器初始化完成！"
echo "⚠️  接下来："
echo "   1. 修改 apps/api/.env.production 中的 JWT 密钥和域名"
echo "   2. 修改 deploy/nginx.conf 中的 your-domain.com"
echo "   3. 执行 bash deploy/deploy.sh 开始部署"
