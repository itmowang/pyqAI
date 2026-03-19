# 博客管理后台

基于 React + TypeScript 构建的现代化博客管理系统。

## 技术栈

- React 18 + TypeScript
- React Router v6 - 路由管理
- TanStack Query - 数据获取和缓存
- Zustand - 状态管理
- Axios - HTTP 客户端
- @blog/ui - UI 组件库
- Tailwind CSS - 样式

## 功能特性

### 认证系统
- JWT Token 认证
- 自动 Token 刷新
- 权限路由保护
- 持久化登录状态

### 核心功能
- 📊 仪表盘 - 数据概览和快速操作
- 📝 文章管理 - 创建、编辑、删除文章
- 🏷️ 标签管理 - 标签 CRUD 操作
- 💬 评论管理 - 审核和删除评论
- 🎨 主题设置 - 可视化主题配置

## 快速开始

### 1. 安装依赖

```bash
cd apps/admin
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

访问：http://localhost:5173

### 3. 登录

使用管理员账户：
- 邮箱：admin@blog.com
- 密码：admin123

## 页面说明

### 登录页 (/login)
- 管理员身份验证
- 只有 ADMIN 角色可以登录
- 自动跳转到仪表盘

### 仪表盘 (/dashboard)
- 数据统计卡片
  - 总文章数
  - 已发布文章数
  - 标签数
  - 评论数
- 快速操作入口
- 系统信息展示

### 文章管理 (/posts)

#### 文章列表
- 分页显示所有文章
- 显示标题、作者、标签、状态
- 编辑和删除操作
- 创建新文章按钮

#### 创建文章 (/posts/create)
- 标题输入
- 内容编辑（支持长文本）
- 图片上传（最多 9 张）
- 标签选择
- 发布状态切换

#### 编辑文章 (/posts/edit/:id)
- 加载现有文章数据
- 修改所有字段
- 保存更新

### 标签管理 (/tags)
- 标签列表展示
- 创建新标签
- 编辑标签（名称和颜色）
- 删除标签
- 显示关联文章数

### 评论管理 (/comments)
- 按文章分组显示
- 标签页切换
- 显示评论和回复
- 删除评论功能

### 主题设置 (/theme)
- 主题列表
- 激活主题
- CSS 变量编辑器
- 实时预览效果

## 开发指南

### 添加新页面

1. 创建页面组件

```tsx
// src/pages/NewPage.tsx
export default function NewPage() {
  return (
    <div>
      <h1>新页面</h1>
    </div>
  );
}
```

2. 添加路由

```tsx
// src/App.tsx
import NewPage from './pages/NewPage';

<Route path="new-page" element={<NewPage />} />
```

3. 添加菜单项

```tsx
// src/components/Layout.tsx
const menuItems = [
  // ...
  { path: '/new-page', icon: '🆕', label: '新页面' },
];
```

### API 调用

使用 TanStack Query：

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/axios';

// 查询数据
const { data, isLoading } = useQuery({
  queryKey: ['posts'],
  queryFn: async () => {
    const response = await api.get('/posts');
    return response.data;
  },
});

// 修改数据
const mutation = useMutation({
  mutationFn: (data) => api.post('/posts', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});
```

### 状态管理

使用 Zustand：

```tsx
import { useAuthStore } from '../store/authStore';

function MyComponent() {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <div>请先登录</div>;
  }
  
  return <div>欢迎，{user?.username}</div>;
}
```

### 使用 UI 组件

```tsx
import { Button, Card, Input, useToast } from '@blog/ui';

function MyComponent() {
  const { showToast } = useToast();
  
  const handleClick = () => {
    showToast('success', '操作成功！');
  };
  
  return (
    <Card>
      <Input label="用户名" />
      <Button onClick={handleClick}>提交</Button>
    </Card>
  );
}
```

## 项目结构

```
apps/admin/src/
├── components/
│   └── Layout.tsx          # 主布局
├── pages/
│   ├── Login.tsx           # 登录
│   ├── Dashboard.tsx       # 仪表盘
│   ├── posts/              # 文章相关
│   ├── tags/               # 标签相关
│   ├── comments/           # 评论相关
│   └── theme/              # 主题相关
├── store/
│   └── authStore.ts        # 认证状态
├── lib/
│   └── axios.ts            # HTTP 客户端
├── App.tsx                 # 根组件
├── main.tsx                # 入口
└── index.css               # 全局样式
```

## 环境变量

在 `vite.config.ts` 中配置代理：

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

## 构建部署

### 开发环境

```bash
pnpm dev
```

### 生产构建

```bash
pnpm build
```

构建产物在 `dist/` 目录。

### 预览构建

```bash
pnpm preview
```

## 常见问题

### Token 过期怎么办？

系统会自动刷新 Token。如果刷新失败，会自动跳转到登录页。

### 如何添加新的 API 接口？

在 `src/lib/axios.ts` 中，Axios 实例已配置好拦截器，直接使用即可：

```typescript
import api from '../lib/axios';

const response = await api.get('/new-endpoint');
```

### 如何处理错误？

使用 Toast 组件显示错误信息：

```typescript
import { useToast } from '@blog/ui';

const { showToast } = useToast();

try {
  await api.post('/endpoint', data);
  showToast('success', '操作成功！');
} catch (error) {
  showToast('error', '操作失败');
}
```

### 如何添加加载状态？

使用 TanStack Query 的 `isLoading` 状态：

```typescript
const { data, isLoading } = useQuery({...});

if (isLoading) {
  return <Loading text="加载中..." />;
}
```

## 性能优化

- 使用 TanStack Query 缓存数据
- 路由懒加载（可选）
- 图片懒加载（可选）
- 虚拟滚动（大列表）

## 安全性

- JWT Token 存储在 localStorage
- 自动 Token 刷新
- 权限路由保护
- HTTPS 部署（生产环境）

## 浏览器支持

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)

## 许可证

MIT
