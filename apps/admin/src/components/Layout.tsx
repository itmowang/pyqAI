import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Avatar } from '@blog/ui';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: '仪表盘' },
    { path: '/posts', icon: '📝', label: '文章管理' },
    { path: '/tags', icon: '🏷️', label: '标签管理' },
    { path: '/comments', icon: '💬', label: '评论管理' },
    { path: '/theme', icon: '🎨', label: '主题设置' },
    { path: '/profile', icon: '👤', label: '个人设置' },
  ];

  const currentPage = menuItems.find(item => location.pathname.startsWith(item.path));

  return (
    <div className="flex h-screen bg-wechat-bg">
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 bg-white border-r border-wechat-divider flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-wechat-divider">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-wechat-link flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-wechat-text">博客后台</p>
              <p className="text-xs text-wechat-subtext">管理系统</p>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-wechat-bg text-wechat-link font-medium border-r-2 border-wechat-link'
                    : 'text-wechat-text hover:bg-wechat-bg'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-wechat-divider">
          <div className="flex items-center gap-2 mb-3">
            <Avatar src={user?.avatar} fallback={user?.username} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-wechat-text truncate">{user?.username}</p>
              <p className="text-xs text-wechat-subtext truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 text-sm text-wechat-subtext border border-wechat-divider hover:text-red-500 hover:border-red-300 transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="px-6 py-3 bg-white border-b border-wechat-divider flex items-center justify-between">
          <h2 className="text-base font-semibold text-wechat-text">
            {currentPage?.label || '管理后台'}
          </h2>
          <Avatar src={user?.avatar} fallback={user?.username} size="sm" />
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-auto bg-wechat-bg">
          <div className="max-w-7xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
