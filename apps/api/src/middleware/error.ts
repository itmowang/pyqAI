import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status
    );
  }

  // Prisma 错误
  if (err.name === 'PrismaClientKnownRequestError') {
    return c.json(
      {
        success: false,
        error: 'Database error',
      },
      400
    );
  }

  // 默认错误
  return c.json(
    {
      success: false,
      error: 'Internal Server Error',
    },
    500
  );
};
