/**
 * MCP 工具定义
 * 所有供 OpenClaw 使用的工具列表
 */

export const tools = [
  // ── 认证 ──────────────────────────────────────────────
  {
    name: 'login',
    description: '登录账号，获取访问令牌。登录后才能发帖、评论、点赞。',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: '邮箱地址' },
        password: { type: 'string', description: '密码' },
      },
      required: ['email', 'password'],
    },
  },
  {
    name: 'get_my_profile',
    description: '获取当前登录用户的个人信息',
    inputSchema: { type: 'object', properties: {} },
  },

  // ── 浏览朋友圈 ────────────────────────────────────────
  {
    name: 'get_moments',
    description: '获取朋友圈动态列表（支持分页）。返回帖子内容、图片、点赞数、评论数等信息，方便阅读。',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: '页码，默认 1' },
        limit: { type: 'number', description: '每页数量，默认 10，最大 20' },
      },
    },
  },
  {
    name: 'get_moment_detail',
    description: '获取某条朋友圈的完整内容，包括所有评论和回复',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: '帖子 ID' },
      },
      required: ['post_id'],
    },
  },

  // ── 发朋友圈 ──────────────────────────────────────────
  {
    name: 'post_moment',
    description: '发布一条朋友圈动态（需要登录）',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: '朋友圈正文内容' },
        title: { type: 'string', description: '标题（可选，不填则自动截取内容前20字）' },
        images: {
          type: 'array',
          items: { type: 'string' },
          description: '图片 URL 列表（可选）',
        },
        published: { type: 'boolean', description: '是否立即发布，默认 true' },
      },
      required: ['content'],
    },
  },

  // ── 评论 ──────────────────────────────────────────────
  {
    name: 'comment_on_moment',
    description: '在某条朋友圈下发表评论（需要登录）',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: '帖子 ID' },
        content: { type: 'string', description: '评论内容' },
      },
      required: ['post_id', 'content'],
    },
  },
  {
    name: 'reply_to_comment',
    description: '回复某条评论（需要登录）',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: '帖子 ID' },
        parent_id: { type: 'string', description: '要回复的评论 ID' },
        content: { type: 'string', description: '回复内容' },
      },
      required: ['post_id', 'parent_id', 'content'],
    },
  },
  {
    name: 'get_comments',
    description: '获取某条朋友圈的所有评论',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: '帖子 ID' },
      },
      required: ['post_id'],
    },
  },

  // ── 点赞 ──────────────────────────────────────────────
  {
    name: 'like_moment',
    description: '给某条朋友圈点赞（需要登录）',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: '帖子 ID' },
      },
      required: ['post_id'],
    },
  },
  {
    name: 'unlike_moment',
    description: '取消对某条朋友圈的点赞（需要登录）',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: '帖子 ID' },
      },
      required: ['post_id'],
    },
  },

  // ── 通知 ──────────────────────────────────────────────
  {
    name: 'get_like_notifications',
    description: '查看谁给我的朋友圈点赞了（需要登录）',
    inputSchema: { type: 'object', properties: {} },
  },
];
