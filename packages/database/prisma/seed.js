import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 开始数据库种子数据...');
    // 清理现有数据
    await prisma.auditLog.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.postTag.deleteMany();
    await prisma.post.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.themeConfig.deleteMany();
    await prisma.user.deleteMany();
    // 创建管理员用户
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@blog.com',
            username: 'admin',
            password: adminPassword,
            role: 'ADMIN',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        },
    });
    console.log('✅ 创建管理员用户:', admin.email);
    // 创建访客用户
    const visitorPassword = await bcrypt.hash('visitor123', 10);
    const visitor = await prisma.user.create({
        data: {
            email: 'visitor@blog.com',
            username: 'visitor',
            password: visitorPassword,
            role: 'VISITOR',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor',
        },
    });
    console.log('✅ 创建访客用户:', visitor.email);
    // 创建标签
    const tags = await Promise.all([
        prisma.tag.create({ data: { name: '技术', color: '#1890ff' } }),
        prisma.tag.create({ data: { name: '生活', color: '#52c41a' } }),
        prisma.tag.create({ data: { name: '随笔', color: '#faad14' } }),
        prisma.tag.create({ data: { name: '旅行', color: '#eb2f96' } }),
    ]);
    console.log('✅ 创建标签:', tags.length, '个');
    // 创建文章
    const post1 = await prisma.post.create({
        data: {
            title: '欢迎来到我的博客',
            content: '这是第一篇文章，分享一些技术心得和生活感悟。',
            images: JSON.stringify([
                'https://picsum.photos/400/300?random=1',
                'https://picsum.photos/400/300?random=2',
            ]),
            published: true,
            authorId: admin.id,
            tags: {
                create: [{ tagId: tags[0].id }, { tagId: tags[1].id }],
            },
        },
    });
    console.log('✅ 创建文章:', post1.title);
    const post2 = await prisma.post.create({
        data: {
            title: '微信朋友圈风格的博客系统',
            content: '今天完成了博客系统的基础架构，采用 Monorepo 设计，支持多主题切换。',
            images: JSON.stringify([
                'https://picsum.photos/400/300?random=3',
                'https://picsum.photos/400/300?random=4',
                'https://picsum.photos/400/300?random=5',
            ]),
            published: true,
            authorId: admin.id,
            tags: {
                create: [{ tagId: tags[0].id }],
            },
        },
    });
    console.log('✅ 创建文章:', post2.title);
    // 创建评论
    const comment1 = await prisma.comment.create({
        data: {
            content: '写得不错，期待更多内容！',
            postId: post1.id,
            userId: visitor.id,
        },
    });
    await prisma.comment.create({
        data: {
            content: '谢谢支持！',
            postId: post1.id,
            userId: admin.id,
            parentId: comment1.id,
        },
    });
    console.log('✅ 创建评论');
    // 创建主题配置
    await prisma.themeConfig.create({
        data: {
            name: 'moments',
            displayName: '微信朋友圈',
            isActive: true,
            cssVariables: JSON.stringify({
                '--color-primary': '#576B95',
                '--color-bg': '#EDEDED',
                '--color-card': '#FFFFFF',
                '--color-text': '#000000',
                '--color-subtext': '#8C8C8C',
                '--border-radius': '0px',
            }),
        },
    });
    await prisma.themeConfig.create({
        data: {
            name: 'minimal',
            displayName: '极简风格',
            isActive: false,
            cssVariables: JSON.stringify({
                '--color-primary': '#000000',
                '--color-bg': '#FFFFFF',
                '--color-card': '#F5F5F5',
                '--color-text': '#333333',
                '--color-subtext': '#999999',
                '--border-radius': '8px',
            }),
        },
    });
    console.log('✅ 创建主题配置');
    console.log('🎉 种子数据创建完成！');
}
main()
    .catch(e => {
    console.error('❌ 种子数据创建失败:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map