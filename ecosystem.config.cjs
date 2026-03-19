/**
 * PM2 进程配置
 * 管理 API 和 MCP 两个 Node.js 进程
 */
module.exports = {
  apps: [
    {
      name: 'blog-api',
      script: './apps/api/dist/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      env_file: './apps/api/.env.production',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'blog-mcp',
      script: './apps/mcp/bundle/mcp-server.mjs',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      env_file: './apps/mcp/.env.production',
      error_file: './logs/mcp-error.log',
      out_file: './logs/mcp-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
