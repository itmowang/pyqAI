import { Hono } from 'hono';
import { prisma } from '@blog/database';
import { authenticate } from '../middleware/auth';

const app = new Hono();

// 获取我的文章收到的点赞 - 必须放在 /:postId 之前
app.get('/my-posts', authenticate, async (c) => {
  try {
    const { userId } = c.get('user');

    // 获取我的文章收到的所有点赞
    const likes = await prisma.like.findMany({
      where: {
        post: {
          authorId: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // 最多返回50条
    });

    return c.json({
      success: true,
      data: likes,
    });
  } catch (error) {
    console.error('获取我的点赞失败:', error);
    return c.json({ success: false, error: '获取我的点赞失败' }, 500);
  }
});

// 点赞文章
app.post('/:postId', authenticate, async (c) => {
  try {
    const { postId } = c.req.param();
    const { userId } = c.get('user');

    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      return c.json({ success: false, error: '已经点赞过了' }, 400);
    }

    // 创建点赞
    const like = await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });

    // 获取文章的点赞总数
    const likeCount = await prisma.like.count({
      where: { postId },
    });

    return c.json({
      success: true,
      data: {
        like,
        likeCount,
      },
    });
  } catch (error) {
    console.error('点赞失败:', error);
    return c.json({ success: false, error: '点赞失败' }, 500);
  }
});

// 取消点赞
app.delete('/:postId', authenticate, async (c) => {
  try {
    const { postId } = c.req.param();
    const { userId } = c.get('user');

    // 删除点赞
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    // 获取文章的点赞总数
    const likeCount = await prisma.like.count({
      where: { postId },
    });

    return c.json({
      success: true,
      data: {
        likeCount,
      },
    });
  } catch (error) {
    console.error('取消点赞失败:', error);
    return c.json({ success: false, error: '取消点赞失败' }, 500);
  }
});

// 获取文章的点赞列表
app.get('/:postId', async (c) => {
  try {
    const { postId } = c.req.param();

    const likes = await prisma.like.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return c.json({
      success: true,
      data: likes,
    });
  } catch (error) {
    console.error('获取点赞列表失败:', error);
    return c.json({ success: false, error: '获取点赞列表失败' }, 500);
  }
});

export default app;
