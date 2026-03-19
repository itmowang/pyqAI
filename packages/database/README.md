# Database Package

基于 Prisma ORM 的数据库层，支持 MySQL。

## 数据模型

### User (用户)
- 支持 RBAC 权限控制（ADMIN / VISITOR）
- 包含基本信息：email, username, avatar
- 关联：posts, comments, auditLogs

### Post (文章/动态)
- 支持富文本内容
- 支持多图片（JSON 数组）
- 发布状态控制
- 关联：author, tags, comments

### Tag (标签)
- 标签名称唯一
- 支持自定义颜色
- 多对多关联 Post

### Comment (评论)
- 支持嵌套回复（parent-child 关系）
- 关联：post, user, parent, replies

### ThemeConfig (主题配置)
- 存储主题名称和显示名
- CSS 变量配置（JSON）
- 激活状态控制

### AuditLog (审计日志)
- 记录后台操作
- 包含操作类型、实体、元数据
- 关联操作用户

## 使用方法

### 1. 配置数据库连接

```bash
cp .env.example .env
# 编辑 .env 文件，配置 MySQL 连接
```

### 2. 生成 Prisma Client

```bash
pnpm db:generate
```

### 3. 推送数据库结构（开发环境）

```bash
pnpm db:push
```

或使用迁移（生产环境）：

```bash
pnpm db:migrate
```

### 4. 填充种子数据

```bash
pnpm db:seed
```

默认账户：
- 管理员：admin@blog.com / admin123
- 访客：visitor@blog.com / visitor123

### 5. 打开 Prisma Studio（可视化管理）

```bash
pnpm db:studio
```

## 在其他包中使用

```typescript
import { prisma, User, Post } from '@blog/database';

// 查询用户
const users = await prisma.user.findMany();

// 创建文章
const post = await prisma.post.create({
  data: {
    title: '标题',
    content: '内容',
    authorId: 'user-id',
  },
});
```

## 索引优化

已为以下字段添加索引以提升查询性能：
- User: email, username
- Post: authorId, published, createdAt
- Comment: postId, userId, parentId
- AuditLog: userId, entity, createdAt
