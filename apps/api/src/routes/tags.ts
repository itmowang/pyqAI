import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '@blog/database';
import { authenticate, requireAdmin } from '../middleware/auth';

const app = new Hono();

const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const updateTagSchema = createTagSchema.partial();

// 获取所有标签（公开）
app.get('/', async (c) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  return c.json({
    success: true,
    data: tags.map((tag: any) => ({
      ...tag,
      postCount: tag._count.posts,
    })),
  });
});

// 创建标签（需要管理员权限）
app.post('/', authenticate, requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const validated = createTagSchema.parse(body);

    const tag = await prisma.tag.create({
      data: validated,
    });

    return c.json({
      success: true,
      data: tag,
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: error.errors[0].message }, 400);
    }
    throw error;
  }
});

// 更新标签（需要管理员权限）
app.put('/:id', authenticate, requireAdmin, async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validated = updateTagSchema.parse(body);

    const tag = await prisma.tag.update({
      where: { id },
      data: validated,
    });

    return c.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: error.errors[0].message }, 400);
    }
    throw error;
  }
});

// 删除标签（需要管理员权限）
app.delete('/:id', authenticate, requireAdmin, async (c) => {
  const { id } = c.req.param();

  await prisma.tag.delete({
    where: { id },
  });

  return c.json({
    success: true,
    message: 'Tag deleted successfully',
  });
});

export default app;
