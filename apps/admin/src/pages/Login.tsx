import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Form, FormItem, FormActions, useToast } from '@blog/ui';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
        showToast('success', '登录成功！');
        navigate('/dashboard');
      }
    } catch (error: any) {
      showToast('error', error.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative animate-scale-in" padding="lg">
        {/* Logo 区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">博客管理后台</h1>
          <p className="text-gray-600">欢迎回来，请登录您的账户</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <FormItem label="邮箱地址" required>
            <Input
              type="email"
              placeholder="admin@blog.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
          </FormItem>

          <FormItem label="密码" required>
            <Input
              type="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </FormItem>

          <FormActions align="center">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </FormActions>
        </Form>

        {/* 测试账户提示 */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-indigo-900 mb-1">测试账户</p>
              <p className="text-indigo-700">邮箱：admin@blog.com</p>
              <p className="text-indigo-700">密码：admin123</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
