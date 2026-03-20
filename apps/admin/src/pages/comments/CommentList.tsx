import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Button,
  DataTable,
  Avatar,
  Modal,
  useToast,
  Loading,
  Empty,
  Tabs,
} from '@blog/ui';
import api from '../../lib/axios';

export default function CommentList() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts-with-comments'],
    queryFn: async () => {
      const response: any = await api.get('/posts?limit=100');
      return response.data.posts.filter((p: any) => p.commentCount > 0);
    },
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', selectedPost],
    queryFn: async () => {
      if (!selectedPost) return [];
      const response: any = await api.get(`/comments/post/${selectedPost}`);
      return response.data;
    },
    enabled: !!selectedPost,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/comments/${id}`),
    onSuccess: () => {
      showToast('success', '评论删除成功');
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['posts-with-comments'] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.error || '删除失败');
    },
  });

  const flattenComments = (comments: any[]): any[] => {
    const result: any[] = [];
    comments.forEach(comment => {
      result.push(comment);
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach((reply: any) => {
          result.push({ ...reply, isReply: true, parentContent: comment.content });
        });
      }
    });
    return result;
  };

  const columns = [
    {
      key: 'user',
      title: '用户',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.user.avatar} fallback={record.user.username} size="sm" />
          <span>{record.user.username}</span>
        </div>
      ),
    },
    {
      key: 'content',
      title: '评论内容',
      render: (_: any, record: any) => (
        <div>
          {record.isReply && (
            <p className="text-xs text-wechat-subtext mb-1">
              回复：{record.parentContent?.substring(0, 30)}...
            </p>
          )}
          <p className={record.isReply ? 'ml-4 text-sm' : ''}>{record.content}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: '时间',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: any, record: any) => (
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 hover:bg-red-50"
          onClick={() => setDeleteId(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <Loading text="加载中..." />;
  }

  return (
    <div className="space-y-4">
      {posts?.length === 0 ? (
        <Card className="bg-white border border-wechat-divider">
          <Empty description="还没有评论" />
        </Card>
      ) : (
        <Card className="bg-white border border-wechat-divider">
          <Tabs
            tabs={posts?.map((post: any) => ({
              key: post.id,
              label: `${post.title} (${post.commentCount})`,
              content: (
                <div>
                  {commentsLoading ? (
                    <Loading text="加载评论..." />
                  ) : comments?.length === 0 ? (
                    <Empty description="暂无评论" />
                  ) : (
                    <DataTable
                      columns={columns}
                      data={flattenComments(comments || [])}
                      rowKey="id"
                    />
                  )}
                </div>
              ),
            })) || []}
            onChange={key => setSelectedPost(key)}
          />
        </Card>
      )}

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="确认删除"
        size="sm"
      >
        <p className="text-wechat-subtext mb-4">确定要删除这条评论吗？此操作无法撤销。</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            取消
          </Button>
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '删除中...' : '确定删除'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
