#!/bin/bash

echo "🚀 开始初始化数据库..."

# 检查 .env 文件
if [ ! -f "packages/database/.env" ]; then
  echo "⚠️  未找到 .env 文件，从示例复制..."
  cp packages/database/.env.example packages/database/.env
  echo "📝 请编辑 packages/database/.env 配置数据库连接"
  exit 1
fi

# 进入 database 目录
cd packages/database

echo "📦 生成 Prisma Client..."
pnpm db:generate

echo "🔨 推送数据库结构..."
pnpm db:push

echo "🌱 填充种子数据..."
pnpm db:seed

echo "✅ 数据库初始化完成！"
echo ""
echo "默认账户："
echo "  管理员: admin@blog.com / admin123"
echo "  访客: visitor@blog.com / visitor123"
echo ""
echo "运行 'pnpm db:studio' 打开数据库管理界面"
