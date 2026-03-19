import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '@blog/database';
import { authenticate } from '../middleware/auth';

const app = new Hono();

const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
  postId: z.string(),
  parentId: z.string().optional(),
});

// 创建评论（需要登录）
app.post('/', authenticate, async (c) => {
  try {
    const body = await c.req.json();
    const validated = createCommentSchema.parse(body);
    const { userId } = c.get('user');

    const comment = await prisma.comment.create({
      data: {
        content: validated.content,
        postId: validated.postId,
        userId,
        parentId: validated.parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      data: comment,
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: error.errors[0].message }, 400);
    }
    throw error;
  }
});

// 删除评论（管理员或评论作者）
app.delete('/:id', authenticate, async (c) => {
  const { id } = c.req.param();
  const user = c.get('user');

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    return c.json({ success: false, error: 'Comment not found' }, 404);
  }

  // 只有管理员或评论作者可以删除
  if (user.role !== 'ADMIN' && comment.userId !== user.userId) {
    return c.json({ success: false, error: 'Forbidden' }, 403);
  }

  await prisma.comment.delete({
    where: { id },
  });

  return c.json({
    success: true,
    message: 'Comment deleted successfully',
  });
});

// 获取文章的所有评论（公开）
app.get('/post/:postId', async (c) => {
  const { postId } = c.req.param();

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return c.json({
    success: true,
    data: comments,
  });
});

export default app;
