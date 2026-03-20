import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@blog/ui';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response: any = await api.post('/auth/login', formData);
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        if (user.role !== 'ADMIN') {
          showToast('error', '只有管理员可以登录后台');
          return;
        }
        setAuth(user, accessToken, refreshToken);
        showToast('success', '登录成功');
        navigate('/dashboard');
      }
    } catch (error: any) {
      showToast('error', error.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wechat-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white">
        {/* 顶部标题栏 */}
        <div className="bg-wechat-link px-6 py-5 text-center">
          <h1 className="text-xl font-semibold text-white">博客管理后台</h1>
        </div>

        {/* 表单区域 */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-wechat-subtext mb-1">邮箱</label>
            <input
              type="email"
              placeholder="admin@blog.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 border border-wechat-divider bg-white text-sm text-wechat-text focus:outline-none focus:border-wechat-link"
            />
          </div>

          <div>
            <label className="block text-sm text-wechat-subtext mb-1">密码</label>
            <input
              type="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 border border-wechat-divider bg-white text-sm text-wechat-text focus:outline-none focus:border-wechat-link"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={loading}
            className="w-full py-2.5 bg-wechat-link text-white text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </div>

        {/* 测试账户提示 */}
        <div className="mx-6 mb-6 p-3 bg-wechat-bg border border-wechat-divider text-sm">
          <p className="text-wechat-subtext mb-1">测试账户</p>
          <p className="text-wechat-text">admin@blog.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
