import { useQuery } from '@tanstack/react-query';
import { Avatar } from '@blog/ui';
import api from '../../../lib/axios';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState, useEffect } from 'react';

export default function MyLikesNotification() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastReadTime, setLastReadTime] = useState<string | null>(null);

  // 从localStorage读取上次查看时间
  useEffect(() => {
    const saved = localStorage.getItem('lastReadLikesTime');
    if (saved) {
      setLastReadTime(saved);
    }
  }, []);

  // 获取我的文章收到的点赞
  const { data: myLikes } = useQuery({
    queryKey: ['my-likes'],
    queryFn: async () => {
      const response: any = await api.get('/likes/my-posts');
      return response.data;
    },
    refetchInterval: 30000, // 每30秒刷新一次
  });

  // 标记为已读
  const markAsRead = () => {
    const now = new Date().toISOString();
    setLastReadTime(now);
    localStorage.setItem('lastReadLikesTime', now);
  };

  // 展开时标记为已读
  const handleToggle = () => {
    if (!isExpanded) {
      markAsRead();
    }
    setIsExpanded(!isExpanded);
  };

  if (!myLikes || myLikes.length === 0) {
    return null;
  }

  // 过滤出未读的点赞（在上次查看时间之后的）
  const unreadLikes = lastReadTime 
    ? myLikes.filter((like: any) => new Date(like.createdAt) > new Date(lastReadTime))
    : myLikes;

  // 如果没有未读点赞，不显示通知
  if (unreadLikes.length === 0) {
    return null;
  }

  // 按文章分组点赞
  const likesByPost = unreadLikes.reduce((acc: any, like: any) => {
    const postId = like.post.id;
    if (!acc[postId]) {
      acc[postId] = {
        post: like.post,
        likes: [],
        latestTime: like.createdAt,
      };
    }
    acc[postId].likes.push(like);
    // 更新最新时间
    if (new Date(like.createdAt) > new Date(acc[postId].latestTime)) {
      acc[postId].latestTime = like.createdAt;
    }
    return acc;
  }, {});

  // 转换为数组并按最新时间排序
  const groupedLikes = Object.values(likesByPost).sort((a: any, b: any) => 
    new Date(b.latestTime).getTime() - new Date(a.latestTime).getTime()
  );

  // 只显示最新的一条
  const latestGroup: any = groupedLikes[0];
  const totalNewLikes = unreadLikes.length;

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: zhCN,
    });
  };

  return (
    <div 
      className="moments-my-likes-notification"
      onClick={handleToggle}
    >
      <div className="moments-my-likes-header">
        <span className="moments-my-likes-title">
          ❤️ 收到 {totalNewLikes} 个赞
        </span>
        <span className="moments-my-likes-time">
          {formatTime(latestGroup.latestTime)}
        </span>
      </div>
      
      {!isExpanded ? (
        <div className="moments-my-likes-content">
          {/* 点赞用户头像列表 */}
          <div className="moments-my-likes-avatars">
            {latestGroup.likes.slice(0, 5).map((like: any) => (
              <div key={like.id} className="moments-my-likes-avatar">
                <Avatar
                  src={like.user.avatar}
                  fallback={like.user.username}
                  size="sm"
                />
              </div>
            ))}
            {latestGroup.likes.length > 5 && (
              <div className="moments-my-likes-more">
                +{latestGroup.likes.length - 5}
              </div>
            )}
          </div>
          
          {/* 文章预览 */}
          <div className="moments-my-likes-post">
            <div className="moments-my-likes-post-content">
              {latestGroup.post.content.length > 50 
                ? latestGroup.post.content.substring(0, 50) + '...'
                : latestGroup.post.content
              }
            </div>
            {groupedLikes.length > 1 && (
              <div className="moments-my-likes-more-posts">
                还有 {groupedLikes.length - 1} 条朋友圈收到赞
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="moments-my-likes-expanded">
          {groupedLikes.map((group: any) => (
            <div key={group.post.id} className="moments-my-likes-item">
              <div className="moments-my-likes-item-users">
                {group.likes.map((like: any, index: number) => (
                  <span key={like.id}>
                    <span className="moments-likes-username">{like.user.username}</span>
                    {index < group.likes.length - 1 && <span>，</span>}
                  </span>
                ))}
                <span className="text-gray-600"> 赞了你的朋友圈</span>
              </div>
              <div className="moments-my-likes-item-post">
                {group.post.content.length > 60 
                  ? group.post.content.substring(0, 60) + '...'
                  : group.post.content
                }
              </div>
              <div className="moments-my-likes-item-time">
                {formatTime(group.latestTime)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
