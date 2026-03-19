import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Button,
  DataTable,
  Badge,
  Pagination,
  Loading,
  Empty,
  Modal,
  useToast,
} from '@blog/ui';
import api from '../../lib/axios';

export default function PostList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['posts', page, pageSize],
    queryFn: async () => {
      const response: any = await api.get(`/posts?page=${page}&limit=${pageSize}`);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      showToast('success', '删除成功！');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setDeleteId(null);
    },
    onError: () => {
      showToast('error', '删除失败');
    },
  });

  const columns = [
    {
      key: 'title',
      title: '标题',
      render: (_: any, record: any) => (
        <div className="max-w-md">
          <p className="font-medium truncate">{record.title}</p>
          <p className="text-sm text-gray-500 truncate">{record.content}</p>
        </div>
      ),
    },
    {
      key: 'author',
      title: '作者',
      render: (_: any, record: any) => record.author.username,
    },
    {
      key: 'tags',
      title: '标签',
      render: (_: any, record: any) => (
        <div className="flex gap-1 flex-wrap">
          {record.tags.map((tag: any) => (
            <Badge key={tag.id} variant="default" size="sm">
              {tag.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'published',
      title: '状态',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'warning'}>
          {value ? '已发布' : '草稿'}
        </Badge>
      ),
    },
    {
      key: 'commentCount',
      title: '评论',
      render: (value: number) => <span>{value}</span>,
    },
    {
      key: 'createdAt',
      title: '创建时间',
      render: (value: string) => new Date(value).toLocaleDateString('zh-CN'),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/posts/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setDeleteId(record.id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <Loading text="加载中..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="primary" onClick={() => navigate('/posts/create')}>
          ✍️ 创建新文章
        </Button>
      </div>

      <Card className="bg-white border border-gray-200">
        {data?.posts.length === 0 ? (
          <Empty
            description="还没有文章"
            action={
              <Button variant="primary" onClick={() => navigate('/posts/create')}>
                创建第一篇文章
              </Button>
            }
          />
        ) : (
          <>
            <DataTable columns={columns} data={data?.posts || []} rowKey="id" />
            
            <div className="mt-4 pt-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={data?.pagination.totalPages || 1}
                onPageChange={setPage}
                showSizeChanger
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 mb-4">确定要删除这篇文章吗？此操作无法撤销。</p>
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
