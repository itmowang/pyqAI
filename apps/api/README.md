# Blog API Server

基于 Hono.js 构建的高性能博客 API 服务。

## 技术栈

- Hono.js - Web 框架
- JWT - 身份认证
- Prisma - ORM
- Zod - 数据验证
- Bcrypt - 密码加密

## 功能特性

- ✅ JWT 双 Token 认证（Access + Refresh）
- ✅ RBAC 权限控制（ADMIN / VISITOR）
- ✅ RESTful API 设计
- ✅ 请求日志记录
- ✅ 错误处理中间件
- ✅ CORS 跨域支持
- ✅ 数据验证（Zod）

## API 路由

### 认证 (Auth)

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | /api/auth/register | 公开 | 用户注册 |
| POST | /api/auth/login | 公开 | 用户登录 |
| POST | /api/auth/refresh | 公开 | 刷新 Token |
| GET | /api/auth/me | 需登录 | 获取当前用户信息 |

### 文章 (Posts)

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | /api/posts | 公开 | 获取文章列表（支持分页） |
| GET | /api/posts/:id | 公开 | 获取单篇文章 |
| POST | /api/posts | 管理员 | 创建文章 |
| PUT | /api/posts/:id | 管理员 | 更新文章 |
| DELETE | /api/posts/:id | 管理员 | 删除文章 |

### 标签 (Tags)

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | /api/tags | 公开 | 获取所有标签 |
| POST | /api/tags | 管理员 | 创建标签 |
| PUT | /api/tags/:id | 管理员 | 更新标签 |
| DELETE | /api/tags/:id | 管理员 | 删除标签 |

### 评论 (Comments)

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | /api/comments/post/:postId | 公开 | 获取文章评论 |
| POST | /api/comments | 需登录 | 创建评论 |
| DELETE | /api/comments/:id | 作者/管理员 | 删除评论 |

### 主题 (Themes)

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | /api/themes | 公开 | 获取所有主题 |
| GET | /api/themes/active | 公开 | 获取当前激活主题 |
| PUT | /api/themes/:id | 管理员 | 更新主题配置 |

## 快速开始

### 1. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件
```

### 2. 启动开发服务器

```bash
pnpm dev
```

服务器将运行在 http://localhost:3000

## API 使用示例

### 注册用户

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### 登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@blog.com",
    "password": "admin123"
  }'
```

### 获取文章列表

```bash
curl http://localhost:3000/api/posts?page=1&limit=10
```

### 创建文章（需要管理员权限）

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "新文章",
    "content": "文章内容",
    "published": true,
    "tagIds": ["tag-id-1", "tag-id-2"]
  }'
```

## 认证流程

1. 用户登录获取 `accessToken` 和 `refreshToken`
2. 使用 `accessToken` 访问受保护的 API（有效期 15 分钟）
3. `accessToken` 过期后，使用 `refreshToken` 获取新的 Token（有效期 7 天）
4. 在请求头中携带 Token：`Authorization: Bearer YOUR_ACCESS_TOKEN`

## 权限说明

### VISITOR（访客）
- 可以查看已发布的文章
- 可以发表评论
- 可以删除自己的评论

### ADMIN（管理员）
- 拥有所有 VISITOR 权限
- 可以创建、编辑、删除文章
- 可以管理标签
- 可以删除任何评论
- 可以配置主题

## 错误响应格式

```json
{
  "success": false,
  "error": "错误信息"
}
```

## 成功响应格式

```json
{
  "success": true,
  "data": { ... }
}
```

## 开发命令

- `pnpm dev` - 启动开发服务器（热重载）
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm type-check` - 类型检查
