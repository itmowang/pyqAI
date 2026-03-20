# 宝塔面板部署指南（MySQL 版）

> 适用于：宝塔面板已安装，使用 MySQL 数据库

---

## 第一步：安装必要软件

在宝塔面板 → 软件商店，安装以下软件：

| 软件 | 版本要求 | 说明 |
|------|---------|------|
| Nginx | 最新稳定版 | 反向代理 + 静态文件 |
| MySQL | 8.0 | 数据库 |
| Node.js版本管理器 | - | 用于切换 Node 版本 |

安装完 Node.js 版本管理器后，切换到 **Node.js 20.x**。

---

## 第二步：安装 pnpm 和 pm2

SSH 连接服务器，执行：

```bash
npm install -g pnpm pm2
```

验证：

```bash
node -v    # 应显示 v20.x.x
pnpm -v    # 应显示 9.x.x
pm2 -v     # 应显示版本号
```

---

## 第三步：创建 MySQL 数据库

宝塔面板 → 数据库 → 添加数据库：

- 数据库名：`blog`
- 用户名：`blog_user`
- 密码：自定义一个强密码，记下来
- 访问权限：本地服务器

---

## 第四步：上传代码

将项目代码上传到服务器，推荐路径：

```
/www/wwwroot/blog
```

可以用宝塔文件管理器上传压缩包后解压，或者用 git：

```bash
cd /www/wwwroot
git clone <你的仓库地址> blog
```

---

## 第五步：配置环境变量

### API 环境变量

创建文件 `apps/api/.env.production`：

```bash
cat > /www/wwwroot/blog/apps/api/.env.production << 'EOF'
NODE_ENV=production
PORT=3002

# JWT 密钥（务必修改为随机字符串）
JWT_ACCESS_SECRET=请替换为随机字符串_至少32位
JWT_REFRESH_SECRET=请替换为另一个随机字符串_至少32位
JWT_ACCESS_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# 允许跨域的前端地址（替换为你的域名）
ALLOWED_ORIGINS=https://your-domain.com,https://admin.your-domain.com

# 数据库连接（替换为你的 MySQL 信息）
DATABASE_URL="mysql://blog_user:你的密码@127.0.0.1:3306/blog"
EOF
```

### 数据库环境变量

```bash
cat > /www/wwwroot/blog/packages/database/.env << 'EOF'
DATABASE_URL="mysql://blog_user:你的密码@127.0.0.1:3306/blog"
EOF
```

---

## 第六步：执行部署

```bash
cd /www/wwwroot/blog

# 安装依赖
pnpm install --frozen-lockfile

# 生成 Prisma Client
pnpm db:generate

# 创建数据库表结构
pnpm db:push

# 构建所有项目
pnpm --filter @blog/api build
pnpm --filter @blog/web build
pnpm --filter @blog/admin build
pnpm mcp:bundle

# 创建日志目录
mkdir -p logs

# 启动 PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # 设置开机自启，按提示执行输出的命令
```

---

## 第七步：配置 Nginx

宝塔面板 → 网站 → 添加站点：

- 域名：`your-domain.com`（主站）
- 域名：`admin.your-domain.com`（管理后台）
- 不需要选 PHP，纯静态

添加完成后，点击站点 → 配置文件，将内容替换为以下配置：

### 主站配置（your-domain.com）

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /www/wwwroot/blog/apps/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 管理后台配置（admin.your-domain.com）

```nginx
server {
    listen 80;
    server_name admin.your-domain.com;

    root /www/wwwroot/blog/apps/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

配置完成后重载 Nginx：

```bash
nginx -s reload
```

---

## 第八步：申请 SSL 证书（可选但推荐）

宝塔面板 → 网站 → 点击域名 → SSL → Let's Encrypt → 申请

申请成功后开启强制 HTTPS。

---

## 验证部署

```bash
# 检查 API 是否正常
curl http://127.0.0.1:3002/

# 查看 PM2 进程状态
pm2 status

# 查看日志
pm2 logs blog-api --lines 50
```

访问 `http://your-domain.com` 应该能看到前端页面。

---

## 后续更新部署

代码更新后，在项目目录执行：

```bash
cd /www/wwwroot/blog
git pull
bash deploy/deploy.sh
```

---

## 常见问题

**Q: pm2 logs 显示数据库连接失败**
检查 `apps/api/.env.production` 里的 `DATABASE_URL` 是否正确，密码是否有特殊字符（需要 URL 编码）。

**Q: 前端页面空白**
检查 Nginx root 路径是否正确，dist 目录是否存在。

**Q: API 返回 502**
检查 PM2 进程是否在运行：`pm2 status`，查看日志：`pm2 logs blog-api`。
