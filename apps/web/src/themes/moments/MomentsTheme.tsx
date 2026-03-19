import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Loading, Empty } from '@blog/ui';
import api from '../../lib/axios';
import PostCard from './components/PostCard';
import LoginButton from '../../components/LoginButton';
import MyLikesNotification from './components/MyLikesNotification';
import './moments.css';

interface MomentsThemeProps {
  children?: ReactNode;
}

export default function MomentsTheme({ children }: MomentsThemeProps) {
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response: any = await api.get('/posts?published=true&limit=50');
      return response.data.posts;
    },
  });

  // 获取当前登录用户信息
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      try {
        const response: any = await api.get('/auth/me');
        return response.data;
      } catch (error: any) {
        // Token过期或无效，清除localStorage（但不刷新页面）
        if (error.response?.status === 401 || error.response?.status === 404) {
          console.log('用户信息获取失败，清除登录状态');
          localStorage.removeItem('token');
          localStorage.removeItem('username');
        }
        return null;
      }
    },
    enabled: !!localStorage.getItem('token'),
    retry: false, // 不重试
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-wechat-bg flex items-center justify-center">
        <Loading text="加载中..." />
      </div>
    );
  }

  return (
    <div className="moments-theme">
      {/* 顶部背景和头像 - 居中布局 */}
      <div className="moments-header">
        <div className="moments-header-container">
          <div className="moments-header-bg">
            <img
              src="https://picsum.photos/800/400?random=cover"
              alt="Cover"
            />
            {/* 左上角网站名字 */}
            <div className="moments-site-name">
              <h1>朋友圈</h1>
            </div>
            {/* 右上角登录/发朋友圈按钮 */}
            <div className="moments-header-action">
              <LoginButton onPostCreated={() => refetch()} currentUser={currentUser} />
            </div>
          </div>
          <div className="moments-header-info">
            <div className="moments-header-name">
              {currentUser ? currentUser.username : '欢迎你，陌生人'}
            </div>
            <div className="moments-header-avatar">
              <Avatar
                src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=stranger'}
                fallback={currentUser?.username || '陌生人'}
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="moments-content">
        {/* 我收到的点赞通知 - 只在登录时显示 */}
        {currentUser && <MyLikesNotification />}
        
        {posts?.length === 0 ? (
          <div className="p-8">
            <Empty description="还没有发布任何内容" />
          </div>
        ) : (
          <div className="moments-list">
            {posts?.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
