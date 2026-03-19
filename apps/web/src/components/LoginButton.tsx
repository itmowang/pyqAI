import { useState, useEffect } from 'react';
import api from '../lib/axios';
import CreatePostModal from './CreatePostModal';

interface LoginButtonProps {
  onPostCreated?: () => void;
  currentUser?: any;
}

export default function LoginButton({ onPostCreated, currentUser }: LoginButtonProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (savedUsername && token) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
    } else {
      // 如果token或username缺失，清除所有登录信息
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setIsLoggedIn(false);
      setUsername('');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response: any = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('username', response.data.user.username);
      setUsername(response.data.user.username);
      setIsLoggedIn(true);
      setIsLoginOpen(false);
      setFormData({ email: '', password: '', username: '' });
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.error || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response: any = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        username: formData.username,
      });
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('username', response.data.user.username);
      setUsername(response.data.user.username);
      setIsLoggedIn(true);
      setIsLoginOpen(false);
      setFormData({ email: '', password: '', username: '' });
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.error || '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    window.location.reload();
  };

  const quickLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response: any = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('username', response.data.user.username);
      setUsername(response.data.user.username);
      setIsLoggedIn(true);
      setIsLoginOpen(false);
      window.location.reload();
    } catch (error) {
      alert('快速登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const openLoginModal = () => {
    setActiveTab('login');
    setFormData({ email: '', password: '', username: '' });
    setIsLoginOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const response: any = await api.put('/auth/avatar', { avatar: base64 });
        setAvatarUrl(response.data.avatar);
        alert('头像更新成功！刷新页面查看');
        window.location.reload();
      } catch (error: any) {
        alert(error.response?.data?.error || '头像更新失败');
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = () => {
    if (isLoggedIn) {
      setIsCreatePostOpen(true);
    } else {
      openLoginModal();
    }
  };

  const handlePostCreated = () => {
    if (onPostCreated) {
      onPostCreated();
    }
  };

  return (
    <>
      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreatePost}
            className="w-9 h-9 bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg border border-white/30"
            title="发朋友圈"
          >
            <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-9 h-9 bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg border border-white/30"
            title="个人信息"
          >
            <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={openLoginModal}
          className="w-9 h-9 bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg border border-white/30"
          title="登录"
        >
          <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      )}

      {/* 登录/注册模态框 */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLoginOpen(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header with Tabs */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 pt-5 pb-0">
              <div className="flex gap-6 border-b border-white/20">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`pb-3 px-2 text-base font-semibold transition-all relative ${
                    activeTab === 'login'
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  登录
                  {activeTab === 'login' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`pb-3 px-2 text-base font-semibold transition-all relative ${
                    activeTab === 'register'
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  注册
                  {activeTab === 'register' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                    <input
                      type="email"
                      placeholder="请输入邮箱"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
                    <input
                      type="password"
                      placeholder="请输入密码"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* 快速登录 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">测试账号</p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => quickLogin('visitor@blog.com', 'visitor123')}
                        disabled={isLoading}
                        className="w-full text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all text-sm"
                      >
                        <div className="font-medium text-gray-900">访客账号</div>
                        <div className="text-gray-500 text-xs">visitor@blog.com</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => quickLogin('admin@blog.com', 'admin123')}
                        disabled={isLoading}
                        className="w-full text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all text-sm"
                      >
                        <div className="font-medium text-gray-900">管理员账号</div>
                        <div className="text-gray-500 text-xs">admin@blog.com</div>
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsLoginOpen(false)}
                      className="flex-1 px-6 py-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all text-base"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-base"
                    >
                      {isLoading ? '登录中...' : '登录'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                    <input
                      type="text"
                      placeholder="请输入用户名"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      minLength={2}
                      maxLength={20}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                    <input
                      type="email"
                      placeholder="请输入邮箱"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
                    <input
                      type="password"
                      placeholder="请输入密码（至少6位）"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      注册后即可发朋友圈、评论和点赞
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsLoginOpen(false)}
                      className="flex-1 px-6 py-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all text-base"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-base"
                    >
                      {isLoading ? '注册中...' : '注册'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 发朋友圈模态框 */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSuccess={handlePostCreated}
      />

      {/* 个人信息模态框 */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">个人信息</h3>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* 头像 */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 mb-4">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="头像" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-600 text-3xl font-bold">
                      {currentUser?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <label className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                  {isUploadingAvatar ? '上传中...' : '更换头像'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* 用户信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {currentUser?.username || '未知'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {currentUser?.email || '未知'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {currentUser?.role === 'ADMIN' ? '管理员' : '普通用户'}
                  </div>
                </div>
              </div>

              {/* 退出登录按钮 */}
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                }}
                className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all text-base"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
