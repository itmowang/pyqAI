import { useQuery } from '@tanstack/react-query';
import { Loading } from '@blog/ui';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [posts, tags] = await Promise.all([
        api.get('/posts?limit=100'),
        api.get('/tags'),
      ]);
      const allPosts = (posts as any).data.posts;
      return {
        totalPosts: (posts as any).data.pagination.total,
        publishedPosts: allPosts.filter((p: any) => p.published).length,
        totalTags: (tags as any).data.length,
        totalComments: allPosts.reduce((sum: number, post: any) => sum + post.commentCount, 0),
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
    { title: '总文章数', value: stats?.totalPosts || 0, icon: '📝' },
    { title: '已发布', value: stats?.publishedPosts || 0, icon: '✅' },
    { title: '标签数', value: stats?.totalTags || 0, icon: '🏷️' },
    { title: '评论数', value: stats?.totalComments || 0, icon: '💬' },
  ];

  const quickActions = [
    { path: '/posts/create', icon: '✍️', label: '创建新文章', desc: '发布新的博客内容' },
    { path: '/tags', icon: '🏷️', label: '管理标签', desc: '添加或编辑标签' },
    { path: '/theme', icon: '🎨', label: '主题设置', desc: '自定义网站外观' },
    { path: '/profile', icon: '👤', label: '个人设置', desc: '修改密码等账户信息' },
  ];

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(card => (
          <div key={card.title} className="bg-white border border-wechat-divider p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-wechat-subtext text-sm">{card.title}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-wechat-text">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 快速操作 */}
        <div className="bg-white border border-wechat-divider">
          <div className="px-4 py-3 border-b border-wechat-divider">
            <h3 className="text-sm font-semibold text-wechat-text">快速操作</h3>
          </div>
          <div className="divide-y divide-wechat-divider">
            {quickActions.map(action => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-wechat-bg transition-colors text-left"
              >
                <div className="w-8 h-8 bg-wechat-bg flex items-center justify-center text-base flex-shrink-0">
                  {action.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-wechat-text">{action.label}</p>
                  <p className="text-xs text-wechat-subtext">{action.desc}</p>
                </div>
                <svg className="w-4 h-4 text-wechat-subtext ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* 系统信息 */}
        <div className="bg-white border border-wechat-divider">
          <div className="px-4 py-3 border-b border-wechat-divider">
            <h3 className="text-sm font-semibold text-wechat-text">系统信息</h3>
          </div>
          <div className="divide-y divide-wechat-divider">
            {[
              { label: '系统版本', value: 'v1.0.0' },
              { label: '数据库', value: 'MySQL' },
              { label: '后端框架', value: 'Hono.js' },
              { label: '前端框架', value: 'React 18' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center px-4 py-3">
                <span className="text-sm text-wechat-subtext">{item.label}</span>
                <span className="text-sm text-wechat-link font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
