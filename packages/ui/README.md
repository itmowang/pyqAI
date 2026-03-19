# @blog/ui - UI 组件库

基于 Tailwind CSS 构建的 React 组件库，为博客系统提供统一的 UI 组件。

## 安装

```bash
pnpm add @blog/ui
```

## 使用

```tsx
import { Button, Input, Card } from '@blog/ui';
import '@blog/ui/styles';

function App() {
  return (
    <Card>
      <Input label="用户名" placeholder="请输入用户名" />
      <Button variant="primary">提交</Button>
    </Card>
  );
}
```

## 组件列表

### 布局 & 导航

#### Sidebar
侧边栏导航组件

```tsx
import { Sidebar, SidebarItem } from '@blog/ui';

<Sidebar>
  <SidebarItem icon="📊" label="仪表盘" active />
  <SidebarItem icon="📝" label="文章管理" />
  <SidebarItem icon="🏷️" label="标签管理" />
</Sidebar>
```

#### ThemeProvider
主题提供者，用于注入 CSS 变量

```tsx
import { ThemeProvider } from '@blog/ui';

<ThemeProvider cssVariables={{ '--color-primary': '#1890ff' }}>
  <App />
</ThemeProvider>
```

### 表单组件

#### Button
按钮组件

```tsx
<Button variant="primary" size="md">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="outline">边框按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
```

Props:
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean

#### Input
输入框组件

```tsx
<Input 
  label="邮箱" 
  placeholder="请输入邮箱"
  error="邮箱格式不正确"
/>
```

Props:
- `label`: string
- `error`: string
- 支持所有原生 input 属性

#### Textarea
文本域组件

```tsx
<Textarea 
  label="内容"
  showCount
  maxLength={500}
  rows={5}
/>
```

Props:
- `label`: string
- `error`: string
- `showCount`: boolean - 显示字数统计
- `maxLength`: number

#### Select
下拉选择组件

```tsx
<Select
  label="分类"
  placeholder="请选择分类"
  options={[
    { value: '1', label: '技术' },
    { value: '2', label: '生活' },
  ]}
/>
```

Props:
- `options`: Array<{ value: string; label: string; disabled?: boolean }>
- `placeholder`: string

#### Checkbox
复选框组件

```tsx
<Checkbox label="记住我" />
```

#### Form
表单容器组件

```tsx
<Form onSubmit={handleSubmit}>
  <FormItem label="用户名" required error={errors.username}>
    <Input {...register('username')} />
  </FormItem>
  
  <FormActions align="right">
    <Button variant="outline">取消</Button>
    <Button variant="primary" type="submit">提交</Button>
  </FormActions>
</Form>
```

#### ImageUpload
图片上传组件

```tsx
<ImageUpload
  value={images}
  onChange={setImages}
  maxCount={9}
  maxSize={5}
/>
```

Props:
- `value`: string[] - 图片 URL 数组
- `onChange`: (urls: string[]) => void
- `maxCount`: number - 最大上传数量
- `maxSize`: number - 单张图片最大大小（MB）

### 数据展示

#### Card
卡片容器

```tsx
<Card padding="md">
  <h3>标题</h3>
  <p>内容</p>
</Card>
```

Props:
- `padding`: 'none' | 'sm' | 'md' | 'lg'

#### DataTable
数据表格

```tsx
<DataTable
  columns={[
    { key: 'title', title: '标题' },
    { 
      key: 'status', 
      title: '状态',
      render: (value) => <Badge>{value}</Badge>
    },
  ]}
  data={posts}
  rowKey="id"
/>
```

Props:
- `columns`: Array<{ key: string; title: string; render?: Function }>
- `data`: Array<any>
- `rowKey`: string

#### Badge
徽章标签

```tsx
<Badge variant="success">已发布</Badge>
<Badge variant="warning">草稿</Badge>
<Badge variant="danger">已删除</Badge>
```

Props:
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'danger'
- `size`: 'sm' | 'md' | 'lg'

#### Avatar
头像组件

```tsx
<Avatar src="https://..." alt="用户名" size="md" />
<Avatar fallback="张三" size="lg" />
```

Props:
- `src`: string - 图片 URL
- `alt`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `fallback`: string - 无图片时显示的文字

#### Tabs
标签页组件

```tsx
<Tabs
  tabs={[
    { key: '1', label: '全部', content: <PostList /> },
    { key: '2', label: '已发布', content: <PublishedList /> },
    { key: '3', label: '草稿', content: <DraftList /> },
  ]}
  defaultActiveKey="1"
  onChange={handleTabChange}
/>
```

#### Empty
空状态组件

```tsx
<Empty 
  description="暂无数据"
  action={<Button>创建新文章</Button>}
/>
```

### 反馈组件

#### Modal
模态框

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="确认删除"
  size="md"
>
  <p>确定要删除这篇文章吗？</p>
  <div className="flex gap-2 mt-4">
    <Button onClick={handleClose}>取消</Button>
    <Button variant="primary" onClick={handleDelete}>确定</Button>
  </div>
</Modal>
```

Props:
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg'

#### Loading
加载指示器

```tsx
<Loading size="md" text="加载中..." />
<Loading fullscreen text="正在处理..." />
```

Props:
- `size`: 'sm' | 'md' | 'lg'
- `text`: string
- `fullscreen`: boolean

#### Toast
消息提示

```tsx
// 在根组件包裹
<ToastProvider duration={3000}>
  <App />
</ToastProvider>

// 在组件中使用
import { useToast } from '@blog/ui';

function MyComponent() {
  const { showToast } = useToast();
  
  const handleSuccess = () => {
    showToast('success', '操作成功！');
  };
  
  const handleError = () => {
    showToast('error', '操作失败！');
  };
}
```

### 导航组件

#### Pagination
分页组件

```tsx
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  showSizeChanger
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[10, 20, 50]}
/>
```

Props:
- `currentPage`: number
- `totalPages`: number
- `onPageChange`: (page: number) => void
- `showSizeChanger`: boolean
- `pageSize`: number
- `onPageSizeChange`: (size: number) => void

## 样式定制

### CSS 变量

在 `:root` 中定义以下变量来定制主题：

```css
:root {
  --color-primary: #1890ff;
  --color-secondary: #52c41a;
  --border-radius: 4px;
}
```

### Tailwind 配置

组件使用 Tailwind CSS 类名，可以通过 Tailwind 配置文件定制：

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
      },
    },
  },
};
```

## 开发

```bash
# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## 组件统计

- 总组件数：20+
- 表单组件：7 个
- 数据展示：6 个
- 反馈组件：3 个
- 布局导航：3 个
