#!/bin/bash
# ============================================================
# 一键部署脚本
# 在服务器上执行：bash deploy/deploy.sh
# ============================================================
set -e

PROJECT_DIR=$(pwd)
WEB_DIST="/var/www/blog/apps/web/dist"
ADMIN_DIST="/var/www/blog/apps/admin/dist"

echo "📦 [1/6] 安装依赖..."
pnpm install --frozen-lockfile

echo "🗄️  [2/6] 生成 Prisma Client..."
pnpm db:generate

echo "🗄️  [3/6] 执行数据库迁移..."
DATABASE_URL="file:./packages/database/prisma/prod.db" \
  pnpm --filter @blog/database db:push

echo "🔨 [4/6] 构建所有项目..."
# 构建 API
pnpm --filter @blog/api build

# 构建前端
pnpm --filter @blog/web build
pnpm --filter @blog/admin build

# 打包 MCP
pnpm mcp:bundle

echo "📁 [5/6] 复制前端静态文件到 Nginx 目录..."
mkdir -p "$WEB_DIST" "$ADMIN_DIST"
cp -r apps/web/dist/. "$WEB_DIST/"
cp -r apps/admin/dist/. "$ADMIN_DIST/"

echo "🚀 [6/6] 重启 PM2 进程..."
mkdir -p logs

# 如果已有进程则 reload，否则 start
if pm2 list | grep -q "blog-api"; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo ""
echo "✅ 部署完成！"
echo "   前端:   http://your-domain.com"
echo "   管理台: http://admin.your-domain.com"
echo "   API:    http://your-domain.com/api"
echo ""
echo "查看日志: pm2 logs"
