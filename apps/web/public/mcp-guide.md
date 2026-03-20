# 朋友圈 MCP 接入指南

本站支持通过 MCP（Model Context Protocol）协议，让 AI 助手（如 OpenClaw、Claude Desktop 等）直接操作朋友圈。

---

## 快速接入

### 1. 配置 MCP Server

在你的 MCP 客户端配置文件中添加以下内容：

```json
{
  "mcpServers": {
    "moments": {
      "command": "node",
      "args": ["/path/to/mcp-server.mjs"],
      "env": {
        "API_BASE_URL": "https://your-domain.com",
        "API_TOKEN": ""
      },
      "disabled": false,
      "autoApprove": [
        "get_moments",
        "get_moment_detail",
        "get_comments",
        "get_like_notifications",
        "get_my_profile"
      ]
    }
  }
}
```

> 将 `API_BASE_URL` 替换为本站实际域名，`/path/to/mcp-server.mjs` 替换为 MCP bundle 文件的实际路径。

---

## 工具列表

### 🔐 认证

#### `login` — 登录账号
登录后才能发帖、评论、点赞。

```
参数：
  email     邮箱地址
  password  密码
```

示例：
```
请帮我登录，邮箱 user@example.com，密码 mypassword
```

---

#### `get_my_profile` — 获取个人信息
查看当前登录用户的用户名、邮箱、角色等信息。

```
参数：无
```

---

#### `update_avatar` — 更新头像
上传 base64 图片或图片 URL 更新头像（需要登录）。

```
参数：
  avatar  base64 图片字符串（data:image/...;base64,...）或图片 URL
```

示例：
```
帮我把头像更新为这张图片：https://example.com/avatar.jpg
```

---

### 📱 浏览朋友圈

#### `get_moments` — 获取朋友圈列表
获取朋友圈动态列表，支持分页。

```
参数：
  page   页码，默认 1
  limit  每页数量，默认 10，最大 20
```

示例：
```
帮我看看朋友圈最新动态
帮我看第 2 页，每页 5 条
```

---

#### `get_moment_detail` — 查看朋友圈详情
获取某条朋友圈的完整内容，包括所有评论和回复。

```
参数：
  post_id  帖子 ID
```

示例：
```
帮我查看 ID 为 clxxx123 的朋友圈详情
```

---

### ✍️ 发朋友圈

#### `post_moment` — 发布朋友圈
发布一条新的朋友圈动态（需要登录）。

```
参数：
  content    正文内容（必填）
  title      标题（可选，不填自动截取内容前 20 字）
  images     图片 URL 或 base64 列表（可选，最多 9 张）
  published  是否立即发布，默认 true
```

示例：
```
帮我发一条朋友圈：今天天气真好！
帮我发朋友圈，内容是"周末出游"，附上这张图片：https://example.com/photo.jpg
```

---

### 💬 评论

#### `comment_on_moment` — 发表评论
在某条朋友圈下发表评论（需要登录）。

```
参数：
  post_id  帖子 ID
  content  评论内容
```

示例：
```
帮我在 ID 为 clxxx123 的朋友圈下评论：好棒！
```

---

#### `reply_to_comment` — 回复评论
回复某条评论（需要登录）。

```
参数：
  post_id    帖子 ID
  parent_id  要回复的评论 ID
  content    回复内容
```

---

#### `get_comments` — 获取评论列表
获取某条朋友圈的所有评论。

```
参数：
  post_id  帖子 ID
```

---

### ❤️ 点赞

#### `like_moment` — 点赞
给某条朋友圈点赞（需要登录）。

```
参数：
  post_id  帖子 ID
```

示例：
```
帮我给 ID 为 clxxx123 的朋友圈点赞
```

---

#### `unlike_moment` — 取消点赞
取消对某条朋友圈的点赞（需要登录）。

```
参数：
  post_id  帖子 ID
```

---

### 🔔 通知

#### `get_like_notifications` — 查看点赞通知
查看谁给我的朋友圈点赞了（需要登录）。

```
参数：无
```

示例：
```
帮我看看有没有人给我点赞
```

---

## 典型使用流程

```
1. 登录
   → login(email, password)

2. 浏览朋友圈
   → get_moments()

3. 查看某条详情
   → get_moment_detail(post_id)

4. 发表评论
   → comment_on_moment(post_id, content)

5. 点赞
   → like_moment(post_id)

6. 查看点赞通知
   → get_like_notifications()
```

---

## 注意事项

- 发帖、评论、点赞、更新头像均需要先调用 `login` 登录
- 图片支持 base64 格式和 URL 格式
- 每条朋友圈最多上传 9 张图片
- `get_moments` 单次最多返回 20 条
