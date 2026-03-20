import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '@blog/database';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth';

const app = new Hono();

// 验证 Schema
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  images: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  published: z.boolean().optional().default(false),
});

const updatePostSchema = createPostSchema.partial();

// 获取文章列表（公开，支持分页和筛选）
app.get('/', optionalAuth, async (c) => {
  const page = Number(c.req.query('page')) || 1;
  const limit = Number(c.req.query('limit')) || 10;
  const published = c.req.query('published');
  const user = c.get('user');

  const where: any = {};

  // 非管理员只能看到已发布的文章
  if (!user || user.role !== 'ADMIN') {
    where.published = true;
  } else if (published !== undefined) {
    where.published = published === 'true';
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        likes: user ? {
          where: {
            userId: user.userId,
          },
          select: {
            id: true,
          },
        } : false,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return c.json({
    success: true,
    data: {
      posts: posts.map((post: any) => ({
        ...post,
        images: post.images ? JSON.parse(post.images as string) : [],
        tags: post.tags.map((pt: any) => pt.tag),
        commentCount: post._count.comments,
        likeCount: post._count.likes,
        isLiked: user ? post.likes.length > 0 : false,
        _count: undefined,
        likes: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// 获取单篇文章
app.get('/:id', optionalAuth, async (c) => {
  const { id } = c.req.param();
  const user = c.get('user');

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      comments: {
        where: { parentId: null },
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
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!post) {
    return c.json({ success: false, error: 'Post not found' }, 404);
  }

  // 非管理员不能查看未发布的文章
  if (!post.published && (!user || user.role !== 'ADMIN')) {
    return c.json({ success: false, error: 'Post not found' }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...post,
      images: post.images ? JSON.parse(post.images as string) : [],
      tags: post.tags.map((pt: any) => pt.tag),
    },
  });
});

// 创建文章（需要登录）
app.post('/', authenticate, async (c) => {
  try {
    const body = await c.req.json();
    const validated = createPostSchema.parse(body);
    const { userId } = c.get('user');

    const post = await prisma.post.create({
      data: {
        title: validated.title,
        content: validated.content,
        images: validated.images ? JSON.stringify(validated.images) : null,
        published: validated.published,
        authorId: userId,
        tags: validated.tagIds
          ? {
              create: validated.tagIds.map(tagId => ({ tagId })),
            }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      data: {
        ...post,
        images: post.images ? JSON.parse(post.images as string) : [],
        tags: post.tags.map((pt: any) => pt.tag),
      },
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: error.errors[0].message }, 400);
    }
    throw error;
  }
});

// 更新文章（需要管理员权限）
app.put('/:id', authenticate, requireAdmin, async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validated = updatePostSchema.parse(body);

    // 如果有标签更新，先删除旧的关联
    if (validated.tagIds) {
      await prisma.postTag.deleteMany({
        where: { postId: id },
      });
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.content && { content: validated.content }),
        ...(validated.images && { images: JSON.stringify(validated.images) }),
        ...(validated.published !== undefined && { published: validated.published }),
        ...(validated.tagIds && {
          tags: {
            create: validated.tagIds.map(tagId => ({ tagId })),
          },
        }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      data: {
        ...post,
        images: post.images ? JSON.parse(post.images as string) : [],
        tags: post.tags.map((pt: any) => pt.tag),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: error.errors[0].message }, 400);
    }
    throw error;
  }
});

// 删除文章（需要管理员权限）
app.delete('/:id', authenticate, requireAdmin, async (c) => {
  const { id } = c.req.param();

  await prisma.post.delete({
    where: { id },
  });

  return c.json({
    success: true,
    message: 'Post deleted successfully',
  });
});

export default app;
