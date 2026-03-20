/**
 * 工具处理器 - 每个 MCP 工具的具体实现
 */

import { api, setAuthToken, session } from './api.js';

type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

function ok(text: string): ToolResult {
  return { content: [{ type: 'text', text }] };
}

function err(text: string): ToolResult {
  return { content: [{ type: 'text', text: `❌ ${text}` }], isError: true };
}

function requireLogin(): ToolResult | null {
  if (!session.token) {
    return err('请先调用 login 工具登录账号');
  }
  return null;
}

// 格式化朋友圈列表，方便机器人阅读
function formatMoment(post: any): string {
  const images = post.images?.length ? `\n🖼️  图片: ${post.images.join(', ')}` : '';
  const tags = post.tags?.length ? `\n🏷️  标签: ${post.tags.map((t: any) => t.name).join(', ')}` : '';
  return [
    `📌 ID: ${post.id}`,
    `👤 作者: ${post.author?.username ?? '未知'}`,
    `📝 ${post.title}`,
    `💬 ${post.content}`,
    images,
    tags,
    `❤️  点赞: ${post.likeCount ?? 0}  💭 评论: ${post.commentCount ?? 0}`,
    `🕐 ${new Date(post.createdAt).toLocaleString('zh-CN')}`,
  ].filter(Boolean).join('\n');
}

function formatComment(c: any, indent = ''): string {
  const replies = c.replies?.length
    ? '\n' + c.replies.map((r: any) => formatComment(r, '  └─ ')).join('\n')
    : '';
  return `${indent}💬 [${c.id}] ${c.user?.username}: ${c.content}  (${new Date(c.createdAt).toLocaleString('zh-CN')})${replies}`;
}

export async function handleTool(name: string, args: Record<string, any>): Promise<ToolResult> {
  try {
    switch (name) {
      // ── 登录 ──────────────────────────────────────────
      case 'login': {
        const res = await api.post('/api/auth/login', {
          email: args.email,
          password: args.password,
        });
        const { user, accessToken } = res.data.data;
        session.token = accessToken;
        session.userId = user.id;
        session.username = user.username;
        setAuthToken(accessToken);
        return ok(
          `✅ 登录成功！\n👤 用户名: ${user.username}\n📧 邮箱: ${user.email}\n🔑 角色: ${user.role}`
        );
      }

      // ── 个人信息 ──────────────────────────────────────
      case 'get_my_profile': {
        const guard = requireLogin();
        if (guard) return guard;
        const res = await api.get('/api/auth/me');
        const u = res.data.data;
        return ok(
          `👤 ${u.username}\n📧 ${u.email}\n🔑 角色: ${u.role}\n🕐 注册时间: ${new Date(u.createdAt).toLocaleString('zh-CN')}`
        );
      }

      // ── 获取朋友圈列表 ────────────────────────────────
      case 'get_moments': {
        const page = args.page ?? 1;
        const limit = Math.min(args.limit ?? 10, 20);
        const res = await api.get('/api/posts', { params: { page, limit } });
        const { posts, pagination } = res.data.data;

        if (!posts.length) return ok('暂无朋友圈动态');

        const list = posts.map((p: any, i: number) =>
          `─── ${(page - 1) * limit + i + 1} ───\n${formatMoment(p)}`
        ).join('\n\n');

        return ok(
          `📱 朋友圈动态 (第 ${page}/${pagination.totalPages} 页，共 ${pagination.total} 条)\n\n${list}`
        );
      }

      // ── 获取单条朋友圈详情 ────────────────────────────
      case 'get_moment_detail': {
        const res = await api.get(`/api/posts/${args.post_id}`);
        const post = res.data.data;
        const images = post.images?.length ? `\n🖼️  图片:\n${post.images.map((u: string) => `  - ${u}`).join('\n')}` : '';
        const tags = post.tags?.length ? `\n🏷️  标签: ${post.tags.map((t: any) => t.name).join(', ')}` : '';

        const commentSection = post.comments?.length
          ? '\n\n── 评论 ──\n' + post.comments.map((c: any) => formatComment(c)).join('\n')
          : '\n\n── 暂无评论 ──';

        return ok(
          `📌 ID: ${post.id}\n👤 作者: ${post.author?.username}\n📝 ${post.title}\n\n${post.content}${images}${tags}\n\n❤️  点赞: ${post._count?.likes ?? 0}  💭 评论: ${post._count?.comments ?? 0}\n🕐 ${new Date(post.createdAt).toLocaleString('zh-CN')}${commentSection}`
        );
      }

      // ── 发朋友圈 ──────────────────────────────────────
      case 'post_moment': {
        const guard = requireLogin();
        if (guard) return guard;

        const title = args.title || args.content.slice(0, 20) + (args.content.length > 20 ? '...' : '');
        const res = await api.post('/api/posts', {
          title,
          content: args.content,
          images: args.images ?? [],
          published: args.published ?? true,
        });
        const post = res.data.data;
        return ok(`✅ 发布成功！\n📌 ID: ${post.id}\n📝 ${post.title}\n🕐 ${new Date(post.createdAt).toLocaleString('zh-CN')}`);
      }

      // ── 评论 ──────────────────────────────────────────
      case 'comment_on_moment': {
        const guard = requireLogin();
        if (guard) return guard;
        const res = await api.post('/api/comments', {
          postId: args.post_id,
          content: args.content,
        });
        const c = res.data.data;
        return ok(`✅ 评论成功！\n💬 [${c.id}] ${c.content}\n🕐 ${new Date(c.createdAt).toLocaleString('zh-CN')}`);
      }

      case 'reply_to_comment': {
        const guard = requireLogin();
        if (guard) return guard;
        const res = await api.post('/api/comments', {
          postId: args.post_id,
          parentId: args.parent_id,
          content: args.content,
        });
        const c = res.data.data;
        return ok(`✅ 回复成功！\n💬 [${c.id}] ${c.content}\n🕐 ${new Date(c.createdAt).toLocaleString('zh-CN')}`);
      }

      case 'get_comments': {
        const res = await api.get(`/api/comments/post/${args.post_id}`);
        const comments: any[] = res.data.data;
        if (!comments.length) return ok('该动态暂无评论');
        return ok(`💭 评论列表 (共 ${comments.length} 条)\n\n` + comments.map(c => formatComment(c)).join('\n'));
      }

      // ── 点赞 ──────────────────────────────────────────
      case 'like_moment': {
        const guard = requireLogin();
        if (guard) return guard;
        const res = await api.post(`/api/likes/${args.post_id}`);
        return ok(`❤️  点赞成功！当前点赞数: ${res.data.data.likeCount}`);
      }

      case 'unlike_moment': {
        const guard = requireLogin();
        if (guard) return guard;
        const res = await api.delete(`/api/likes/${args.post_id}`);
        return ok(`💔 已取消点赞。当前点赞数: ${res.data.data.likeCount}`);
      }

      // ── 更新头像 ──────────────────────────────────────
      case 'update_avatar': {
        const guard = requireLogin();
        if (guard) return guard;
        const res = await api.put('/api/auth/avatar', { avatar: args.avatar });
        const u = res.data.data;
        return ok(`✅ 头像更新成功！\n👤 ${u.username}`);
      }

      // ── 通知 ──────────────────────────────────────────
      case 'get_like_notifications': {
        const guard = requireLogin();
        if (guard) return guard;
        const res = await api.get('/api/likes/my-posts');
        const likes: any[] = res.data.data;
        if (!likes.length) return ok('暂无点赞通知');

        const list = likes.map(l =>
          `❤️  ${l.user.username} 赞了《${l.post.title}》  🕐 ${new Date(l.createdAt).toLocaleString('zh-CN')}`
        ).join('\n');

        return ok(`🔔 点赞通知 (共 ${likes.length} 条)\n\n${list}`);
      }

      default:
        return err(`未知工具: ${name}`);
    }
  } catch (e: any) {
    const msg = e.response?.data?.error ?? e.message ?? '未知错误';
    return err(`API 请求失败: ${msg}`);
  }
}
