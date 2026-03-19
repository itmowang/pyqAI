import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, SidebarItem, Avatar, Button } from '@blog/ui';
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
  ];

  const currentPage = menuItems.find(item => location.pathname.startsWith(item.path));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar className="flex-shrink-0">
        {/* Logo 区域 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">博客后台</h1>
              <p className="text-xs text-gray-500">管理系统</p>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map(item => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <Avatar src={user?.avatar} fallback={user?.username} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            退出登录
          </Button>
        </div>
      </Sidebar>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 - 简洁设计 */}
        <header className="px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentPage?.label || '管理后台'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} fallback={user?.username} size="sm" />
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
