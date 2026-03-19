import { useQuery } from '@tanstack/react-query';
import { Card, Loading, Badge } from '@blog/ui';
import api from '../lib/axios';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [posts, tags, comments] = await Promise.all([
        api.get('/posts?limit=1'),
        api.get('/tags'),
        api.get('/posts'),
      ]);
      
      return {
        totalPosts: (posts as any).data.pagination.total,
        publishedPosts: (posts as any).data.posts.filter((p: any) => p.published).length,
        totalTags: (tags as any).data.length,
        totalComments: (comments as any).data.posts.reduce(
          (sum: number, post: any) => sum + post.commentCount,
          0
        ),
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading text="加载中..." />
      </div>
    );
  }

  const statCards = [
    {
      title: '总文章数',
      value: stats?.totalPosts || 0,
      icon: '📝',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '已发布',
      value: stats?.publishedPosts || 0,
      icon: '✅',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '标签数',
      value: stats?.totalTags || 0,
      icon: '🏷️',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '评论数',
      value: stats?.totalComments || 0,
      icon: '💬',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(card => (
          <Card key={card.title} padding="lg" hover className="bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center text-xl shadow-sm`}>
                {card.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 快速操作和系统信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg" className="bg-white border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="space-y-2">
            <a
              href="/posts/create"
              className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">
                  ✍️
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">创建新文章</p>
                  <p className="text-xs text-gray-500">发布新的博客内容</p>
                </div>
              </div>
            </a>
            <a
              href="/tags"
              className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm">
                  🏷️
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">管理标签</p>
                  <p className="text-xs text-gray-500">添加或编辑标签</p>
                </div>
              </div>
            </a>
            <a
              href="/theme"
              className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">
                  🎨
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">主题设置</p>
                  <p className="text-xs text-gray-500">自定义网站外观</p>
                </div>
              </div>
            </a>
          </div>
        </Card>

        <Card padding="lg" className="bg-white border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">系统信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">系统版本</span>
              <Badge variant="primary">v1.0.0</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">数据库</span>
              <Badge variant="success">SQLite</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">后端框架</span>
              <Badge variant="info">Hono.js</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">前端框架</span>
              <Badge variant="info">React 18</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
