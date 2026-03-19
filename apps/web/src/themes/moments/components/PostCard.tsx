import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@blog/ui';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/axios';
import ImageViewer from './ImageViewer';
import LikeNotification from './LikeNotification';

interface PostCardProps {
  post: any;
}

export default function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();
  // 使用后端返回的点赞状态
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);

  // 获取文章详情（包含评论）- 当showComments为true时加载
  const { data: postDetail, isLoading: commentsLoading, refetch } = useQuery({
    queryKey: ['post-detail', post.id],
    queryFn: async () => {
      const response: any = await api.get(`/posts/${post.id}`);
      return response.data;
    },
    enabled: showComments, // 当需要显示评论时才加载
  });

  // 获取点赞列表
  const { data: likes } = useQuery({
    queryKey: ['post-likes', post.id],
    queryFn: async () => {
      const response: any = await api.get(`/likes/${post.id}`);
      return response.data;
    },
    enabled: likeCount > 0, // 只有有点赞时才加载
  });

  const handleLike = async () => {
    // 检查登录状态
    if (!localStorage.getItem('token')) {
      alert('请先登录后才能点赞');
      return;
    }
    
    try {
      if (liked) {
        // 取消点赞
        const response: any = await api.delete(`/likes/${post.id}`);
        setLiked(false);
        setLikeCount(response.data.likeCount);
      } else {
        // 点赞
        const response: any = await api.post(`/likes/${post.id}`);
        setLiked(true);
        setLikeCount(response.data.likeCount);
      }
    } catch (error: any) {
      console.error('点赞操作失败:', error);
      if (error.response?.status === 401) {
        alert('登录已过期，请重新登录');
      } else {
        alert(error.response?.data?.error || '操作失败，请重试');
      }
    }
  };

  const toggleComments = () => {
    // 检查登录状态
    if (!localStorage.getItem('token')) {
      alert('请先登录后才能查看评论');
      return;
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post('/comments', {
        postId: post.id,
        content: commentText.trim(),
        parentId: replyingTo?.id || undefined,
      });
      setCommentText('');
      setReplyingTo(null);
      refetch(); // 重新加载评论
    } catch (error: any) {
      console.error('发表评论失败:', error);
      console.error('错误详情:', error.response);
      
      // 检查是否有token
      const token = localStorage.getItem('token');
      console.log('当前token:', token ? '存在' : '不存在');
      
      if (error.response?.status === 401) {
        alert('登录已过期，请重新登录\n\n访客账号：visitor@blog.com / visitor123');
        // 清除过期token
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.reload();
      } else {
        const errorMsg = error.response?.data?.error || error.message || '发表评论失败，请重试';
        alert(`发表评论失败：${errorMsg}`);
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

  // 点击卡片跳转到详情页
  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮、图片等交互元素，不跳转
    const target = e.target as HTMLElement;
    if (
      target.closest('.moments-action-btn') ||
      target.closest('.moments-image-item') ||
      target.closest('.moments-comment-input') ||
      target.closest('button') ||
      target.closest('input')
    ) {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  return (
    <>
      <div className="moments-post" onClick={handleCardClick}>
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

          {/* 标题（如果有且不是"朋友圈"） */}
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
              <div className="moments-action-btn" onClick={toggleComments}>
                <span>💬</span>
                {post.commentCount > 0 && <span>{post.commentCount}</span>}
              </div>
            </div>
          </div>

          {/* 点赞和评论区域 - 微信风格 */}
          {(likeCount > 0 || showComments) && (
            <div className="moments-interactions">
              {/* 点赞列表 */}
              {likeCount > 0 && <LikeNotification likes={likes || []} />}
              
              {/* 评论区 */}
              {showComments && (
                <div className="moments-comments-section">
                  {commentsLoading ? (
                    <div className="text-sm text-gray-500">加载评论中...</div>
                  ) : (
                    <>
                      {postDetail?.comments && postDetail.comments.length > 0 ? (
                        postDetail.comments.map((comment: any) => (
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
                    </>
                  )}
                </div>
              )}
            </div>
          )}
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
    </>
  );
}
