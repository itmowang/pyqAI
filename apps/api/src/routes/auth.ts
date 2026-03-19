import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '@blog/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens } from '../utils/jwt';

export type UserRole = 'ADMIN' | 'VISITOR';
import { authenticate } from '../middleware/auth';

const app = new Hono();

// 验证 Schema
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// 注册
app.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const validated = registerSchema.parse(body);

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return c.json({ success: false, error: '该邮箱已被注册' }, 400);
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username: validated.username },
    });

    if (existingUsername) {
      return c.json({ success: false, error: '该用户名已被使用' }, 400);
    }

    // 创建用户
    const hashedPassword = await hashPassword(validated.password);
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        username: validated.username,
        password: hashedPassword,
        role: 'VISITOR',
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    // 生成 Token
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return c.json({
      success: true,
      data: {
        user,
        ...tokens,
      },
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages: Record<string, string> = {
        'Invalid email': '邮箱格式不正确',
        'String must contain at least 3 character(s)': '用户名至少需要3个字符',
        'String must contain at most 20 character(s)': '用户名最多20个字符',
        'String must contain at least 6 character(s)': '密码至少需要6个字符',
      };
      const message = errorMessages[error.errors[0].message] || error.errors[0].message;
      return c.json({ success: false, error: message }, 400);
    }
    throw error;
  }
});

// 登录
app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const validated = loginSchema.parse(body);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      return c.json({ success: false, error: '邮箱或密码错误' }, 401);
    }

    // 验证密码
    const isValid = await comparePassword(validated.password, user.password);

    if (!isValid) {
      return c.json({ success: false, error: '邮箱或密码错误' }, 401);
    }

    // 生成 Token
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          avatar: user.avatar,
        },
        ...tokens,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages: Record<string, string> = {
        'Invalid email': '邮箱格式不正确',
      };
      const message = errorMessages[error.errors[0].message] || '请输入有效的邮箱和密码';
      return c.json({ success: false, error: message }, 400);
    }
    throw error;
  }
});

// 获取当前用户信息
app.get('/me', authenticate, async (c) => {
  const { userId } = c.get('user');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user) {
    return c.json({ success: false, error: '用户不存在' }, 404);
  }

  return c.json({
    success: true,
    data: user,
  });
});

// 更新用户头像
app.put('/avatar', authenticate, async (c) => {
  try {
    const { userId } = c.get('user');
    const body = await c.req.json();
    const { avatar } = body;

    if (!avatar || typeof avatar !== 'string') {
      return c.json({ success: false, error: '头像URL格式不正确' }, 400);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return c.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return c.json({ success: false, error: '头像更新失败' }, 500);
  }
});

// 刷新 Token
app.post('/refresh', async (c) => {
  try {
    const body = await c.req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return c.json({ success: false, error: '需要刷新令牌' }, 400);
    }

    const { verify } = await import('jsonwebtoken');
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

    const decoded = verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: string;
      email: string;
      role: UserRole;
    };

    // 生成新的 Token
    const tokens = generateTokens({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    return c.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    return c.json({ success: false, error: '刷新令牌无效' }, 401);
  }
});

export default app;
