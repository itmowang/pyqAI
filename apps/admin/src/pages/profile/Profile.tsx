import { useState } from 'react';
import { Card, Button } from '@blog/ui';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';

export default function Profile() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (form.newPassword !== form.confirmPassword) {
      setMsg({ type: 'error', text: '两次输入的新密码不一致' });
      return;
    }
    if (form.newPassword.length < 6) {
      setMsg({ type: 'error', text: '新密码至少6位' });
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      setMsg({ type: 'success', text: '密码修改成功' });
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error || '修改失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      {/* 基本信息 */}
      <Card padding="lg" className="bg-white border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">基本信息</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">用户名</span>
            <span className="text-sm font-medium text-gray-900">{user?.username}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">邮箱</span>
            <span className="text-sm font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">角色</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.role === 'ADMIN' ? '管理员' : '普通用户'}
            </span>
          </div>
        </div>
      </Card>

      {/* 修改密码 */}
      <Card padding="lg" className="bg-white border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">修改密码</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">旧密码</label>
            <input
              type="password"
              value={form.oldPassword}
              onChange={e => setForm({ ...form, oldPassword: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="请输入当前密码"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="至少6位"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="再次输入新密码"
            />
          </div>

          {msg && (
            <div className={`text-sm px-3 py-2 rounded-lg ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg.text}
            </div>
          )}

          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading ? '提交中...' : '确认修改'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
