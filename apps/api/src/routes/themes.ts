import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '@blog/database';
import { authenticate, requireAdmin } from '../middleware/auth';

const app = new Hono();

const updateThemeSchema = z.object({
  cssVariables: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// 获取所有主题（公开）
app.get('/', async (c) => {
  const themes = await prisma.themeConfig.findMany({
    orderBy: { name: 'asc' },
  });

  return c.json({
    success: true,
    data: themes.map((theme: any) => ({
      ...theme,
      cssVariables: JSON.parse(theme.cssVariables as string),
    })),
  });
});

// 获取当前激活的主题（公开）
app.get('/active', async (c) => {
  const theme = await prisma.themeConfig.findFirst({
    where: { isActive: true },
  });

  if (!theme) {
    return c.json({ success: false, error: 'No active theme found' }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...theme,
      cssVariables: JSON.parse(theme.cssVariables as string),
    },
  });
});

// 更新主题（需要管理员权限）
app.put('/:id', authenticate, requireAdmin, async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validated = updateThemeSchema.parse(body);

    // 如果要激活这个主题，先取消其他主题的激活状态
    if (validated.isActive) {
      await prisma.themeConfig.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const theme = await prisma.themeConfig.update({
      where: { id },
      data: {
        ...(validated.cssVariables && {
          cssVariables: JSON.stringify(validated.cssVariables),
        }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
    });

    return c.json({
      success: true,
      data: {
        ...theme,
        cssVariables: JSON.parse(theme.cssVariables as string),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: error.errors[0].message }, 400);
    }
    throw error;
  }
});

export default app;
