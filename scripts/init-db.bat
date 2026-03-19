@echo off
echo 🚀 开始初始化数据库...

if not exist "packages\database\.env" (
  echo ⚠️  未找到 .env 文件，从示例复制...
  copy packages\database\.env.example packages\database\.env
  echo 📝 请编辑 packages\database\.env 配置数据库连接
  exit /b 1
)

cd packages\database

echo 📦 生成 Prisma Client...
call pnpm db:generate

echo 🔨 推送数据库结构...
call pnpm db:push

echo 🌱 填充种子数据...
call pnpm db:seed

echo ✅ 数据库初始化完成！
echo.
echo 默认账户：
echo   管理员: admin@blog.com / admin123
echo   访客: visitor@blog.com / visitor123
echo.
echo 运行 'pnpm db:studio' 打开数据库管理界面

cd ..\..
