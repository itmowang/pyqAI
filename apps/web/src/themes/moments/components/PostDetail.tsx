import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, Loading } from '@blog/ui';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import ImageViewer from './ImageViewer';
import LikeNotification from './LikeNotification';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 获取文章详情
  const { data: post, isLoading, refetch } = useQuery({
    queryKey: ['post-detail', postId],
    queryFn: async () => {
      const response: any = await api.get(`/posts/${postId}`);
      return response.data;
    },
  });

  // 获取点赞列表 - 始终启用，让后端返回空数组
  const { data: likes, refetch: refetchLikes } = useQuery({
    queryKey: ['post-likes', postId],
    queryFn: async () => {
      const response: any = await api.get(`/likes/${postId}`);
      return response.data;
    },
    enabled: !!postId, // 只要有postId就启用
  });

  // 更新点赞状态
  useEffect(() => {
    if (post) {
      setLiked(post.isLiked || false);
      setLikeCount(post.likeCount || 0);
    }
  }, [post]);

  const handleLike = async () => {
    if (!localStorage.getItem('token')) {
      alert('请先登录后才能点赞');
      return;
    }
    
    try {
      if (liked) {
        const response: any = await api.delete(`/likes/${postId}`);
        setLiked(false);
        setLikeCount(response.data.likeCount);
      } else {
        const response: any = await api.post(`/likes/${postId}`);
        setLiked(true);
        setLikeCount(response.data.likeCount);
      }
      // 刷新点赞列表
      refetchLikes();
    } catch (error: any) {
      console.error('点赞操作失败:', error);
      if (error.response?.status === 401) {
        alert('登录已过期，请重新登录');
      } else {
        alert(error.response?.data?.error || '操作失败，请重试');
      }
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post('/comments', {
        postId,
        content: commentText.trim(),
        parentId: replyingTo?.id || undefined,
      });
      setCommentText('');
      setReplyingTo(null);
      refetch();
    } catch (error: any) {
      console.error('发表评论失败:', error);
      if (error.response?.status === 401) {
        alert('登录已过期，请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.reload();
      } else {
        alert(error.response?.data?.error || '发表评论失败，请重试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo({ id: commentId, username });
    setCommentText('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setCommentText('');
  };

  const getImageGridClass = (count: number) => {
    return `moments-images-grid grid-${count}`;
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: zhCN,
    });
  };

  if (isLoading) {
    return (
      <div className="moments-theme">
        <div className="moments-detail-header">
          <button onClick={() => navigate(-1)} className="moments-back-btn">
            ← 返回
          </button>
        </div>
        <div className="moments-content">
          <div className="flex items-center justify-center py-20">
            <Loading text="加载中..." />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="moments-theme">
        <div className="moments-detail-header">
          <button onClick={() => navigate(-1)} className="moments-back-btn">
            ← 返回
          </button>
        </div>
        <div className="moments-content">
          <div className="text-center py-20 text-gray-500">
            朋友圈不存在或已被删除
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="moments-theme">
      {/* 顶部导航 */}
      <div className="moments-detail-header">
        <button onClick={() => navigate(-1)} className="moments-back-btn">
          ← 返回
        </button>
      </div>

      {/* 内容区域 */}
      <div className="moments-content">
        <div className="moments-detail-content">
          <div className="moments-post">
            <div className="moments-post-avatar">
              <Avatar
                src={post.author.avatar}
                fallback={post.author.username}
                size="md"
              />
            </div>

            <div className="moments-post-content">
              {/* 作者名 */}
              <div className="moments-post-header">
                <div className="moments-post-author">{post.author.username}</div>
              </div>

              {/* 标题 */}
              {post.title && post.title !== '朋友圈' && (
                <div className="moments-post-title">{post.title}</div>
              )}

              {/* 内容 */}
              <div className="moments-post-text">{post.content}</div>

              {/* 图片 */}
              {post.images && post.images.length > 0 && (
                <div className="moments-post-images">
                  <div className={getImageGridClass(post.images.length)}>
                    {post.images.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="moments-image-item"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img src={image} alt={`图片 ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className="moments-post-tags">
                  {post.tags.map((tag: any) => (
                    <span key={tag.id} className="moments-tag">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* 底部信息 */}
              <div className="moments-post-footer">
                <div className="moments-post-time">{formatTime(post.createdAt)}</div>
                <div className="moments-post-actions">
                  <div
                    className={`moments-action-btn ${liked ? 'liked' : ''}`}
                    onClick={handleLike}
                  >
                    <span>{liked ? '❤️' : '🤍'}</span>
                    {likeCount > 0 && <span>{likeCount}</span>}
                  </div>
                </div>
              </div>

              {/* 点赞和评论区域 - 详情页始终显示 */}
              <div className="moments-interactions">
                {/* 点赞列表 - 始终显示 */}
                <LikeNotification likes={likes || []} alwaysShow={true} />
                
                {/* 评论区 */}
                <div className="moments-comments-section">
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment: any) => (
                      <div key={comment.id} className="moments-comment-item">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="moments-comment-author">
                              {comment.user.username}
                            </span>
                            <span className="moments-comment-text">: {comment.content}</span>
                          </div>
                          {localStorage.getItem('token') && (
                            <button
                              onClick={() => handleReply(comment.id, comment.user.username)}
                              className="text-xs text-blue-600 hover:text-blue-700 ml-2"
                            >
                              回复
                            </button>
                          )}
                        </div>
                        <div className="moments-comment-time">
                          {formatTime(comment.createdAt)}
                        </div>

                        {/* 回复 */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="moments-comment-reply">
                            {comment.replies.map((reply: any) => (
                              <div key={reply.id} className="moments-comment-item">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <span className="moments-comment-author">
                                      {reply.user.username}
                                    </span>
                                    <span className="moments-comment-text">: {reply.content}</span>
                                  </div>
                                  {localStorage.getItem('token') && (
                                    <button
                                      onClick={() => handleReply(comment.id, reply.user.username)}
                                      className="text-xs text-blue-600 hover:text-blue-700 ml-2"
                                    >
                                      回复
                                    </button>
                                  )}
                                </div>
                                <div className="moments-comment-time">
                                  {formatTime(reply.createdAt)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 mb-2">暂无评论</div>
                  )}
                  
                  {/* 评论输入框 */}
                  {localStorage.getItem('token') ? (
                    <form onSubmit={handleSubmitComment} className="moments-comment-input">
                      {replyingTo && (
                        <div className="flex items-center justify-between mb-2 px-3 py-2 bg-blue-50 rounded text-sm">
                          <span className="text-blue-700">
                            回复 @{replyingTo.username}
                          </span>
                          <button
                            type="button"
                            onClick={cancelReply}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            取消
                          </button>
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder={replyingTo ? `回复 @${replyingTo.username}` : "说点什么..."}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={isSubmitting}
                        className="moments-comment-input-field"
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim() || isSubmitting}
                        className="moments-comment-submit"
                      >
                        {isSubmitting ? '发送中...' : '发送'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-2">
                      请先登录后才能评论
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 图片查看器 */}
      {selectedImage && (
        <ImageViewer
          images={post.images}
          currentImage={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
