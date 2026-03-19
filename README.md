# 博客系统 - Monorepo 架构

基于 TypeScript + React + Hono.js + Prisma + MySQL 构建的高性能博客系统。

## 技术栈

- **前端**: React 18, Vite, Tailwind CSS, React Router, TanStack Query
- **后端**: Hono.js, JWT 认证
- **数据库**: Prisma ORM + MySQL
- **包管理**: pnpm workspaces

## 项目结构

```
├── apps/
│   ├── api/          # Hono.js 后端服务
│   ├── admin/        # 后台管理前端
│   └── web/          # 前台展示前端
├── packages/
│   ├── ui/           # 共享 UI 组件库
│   ├── database/     # Prisma Schema
│   └── shared/       # 共享类型和工具
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置数据库

确保已安装 MySQL 8.0+，然后创建数据库：

```sql
CREATE DATABASE blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

配置数据库连接：

```bash
cd packages/database
cp .env.example .env
# 编辑 .env 文件，配置 MySQL 连接
# DATABASE_URL="mysql://root:password@localhost:3306/blog"
```

### 3. 初始化数据库

```bash
# 在根目录执行
pnpm db:generate  # 生成 Prisma Client
pnpm db:push      # 推送数据库结构
pnpm db:seed      # 填充种子数据
```

或使用快捷脚本（Windows）：

```bash
scripts\init-db.bat
```

默认账户：
- 管理员：admin@blog.com / admin123
- 访客：visitor@blog.com / visitor123

### 4. 启动开发服务器

```bash
# 根目录启动所有服务
pnpm dev
```

访问地址：
- 前台: http://localhost:5174
- 后台: http://localhost:5173
- API: http://localhost:3000

## 开发命令

### 通用命令
- `pnpm dev` - 启动所有开发服务器
- `pnpm build` - 构建所有项目
- `pnpm lint` - 代码检查
- `pnpm format` - 代码格式化
- `pnpm type-check` - 类型检查

### 数据库命令
- `pnpm db:generate` - 生成 Prisma Client
- `pnpm db:push` - 推送数据库结构（开发环境）
- `pnpm db:migrate` - 创建迁移（生产环境）
- `pnpm db:seed` - 填充种子数据
- `pnpm db:studio` - 打开数据库管理界面

## 文档

- [数据库 Schema 设计](packages/database/SCHEMA.md)
- [数据库初始化指南](scripts/setup-db.md)
- [项目架构说明](ARCHITECTURE.md)
