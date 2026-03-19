import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Button,
  Input,
  DataTable,
  Badge,
  Modal,
  Form,
  FormItem,
  FormActions,
  useToast,
  Loading,
  Empty,
} from '@blog/ui';
import api from '../../lib/axios';

export default function TagList() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#1890ff',
  });

  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response: any = await api.get('/tags');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post('/tags', data),
    onSuccess: () => {
      showToast('success', '标签创建成功！');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setIsCreateModalOpen(false);
      setFormData({ name: '', color: '#1890ff' });
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.error || '创建失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      api.put(`/tags/${id}`, data),
    onSuccess: () => {
      showToast('success', '标签更新成功！');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setEditingTag(null);
      setFormData({ name: '', color: '#1890ff' });
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.error || '更新失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tags/${id}`),
    onSuccess: () => {
      showToast('success', '标签删除成功！');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.error || '删除失败');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, data: formData });
    }
  };

  const openEditModal = (tag: any) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color || '#1890ff' });
  };

  const columns = [
    {
      key: 'name',
      title: '标签名称',
      render: (_: any, record: any) => (
        <Badge
          variant="default"
          style={{ backgroundColor: record.color, color: '#fff' }}
        >
          {record.name}
        </Badge>
      ),
    },
    {
      key: 'color',
      title: '颜色',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm text-gray-600">{value}</span>
        </div>
      ),
    },
    {
      key: 'postCount',
      title: '文章数',
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
          <Button size="sm" variant="outline" onClick={() => openEditModal(record)}>
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
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          ➕ 创建标签
        </Button>
      </div>

      <Card className="bg-white border border-gray-200">
        {tags?.length === 0 ? (
          <Empty
            description="还没有标签"
            action={
              <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                创建第一个标签
              </Button>
            }
          />
        ) : (
          <DataTable columns={columns} data={tags || []} rowKey="id" />
        )}
      </Card>

      {/* 创建标签模态框 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({ name: '', color: '#1890ff' });
        }}
        title="创建标签"
      >
        <Form onSubmit={handleCreate}>
          <FormItem label="标签名称" required>
            <Input
              placeholder="请输入标签名称"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </FormItem>

          <FormItem label="标签颜色">
            <Input
              type="color"
              value={formData.color}
              onChange={e => setFormData({ ...formData, color: e.target.value })}
            />
          </FormItem>

          <FormActions>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData({ name: '', color: '#1890ff' });
              }}
            >
              取消
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? '创建中...' : '创建'}
            </Button>
          </FormActions>
        </Form>
      </Modal>

      {/* 编辑标签模态框 */}
      <Modal
        isOpen={!!editingTag}
        onClose={() => {
          setEditingTag(null);
          setFormData({ name: '', color: '#1890ff' });
        }}
        title="编辑标签"
      >
        <Form onSubmit={handleUpdate}>
          <FormItem label="标签名称" required>
            <Input
              placeholder="请输入标签名称"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </FormItem>

          <FormItem label="标签颜色">
            <Input
              type="color"
              value={formData.color}
              onChange={e => setFormData({ ...formData, color: e.target.value })}
            />
          </FormItem>

          <FormActions>
            <Button
              variant="outline"
              onClick={() => {
                setEditingTag(null);
                setFormData({ name: '', color: '#1890ff' });
              }}
            >
              取消
            </Button>
            <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </FormActions>
        </Form>
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 mb-4">确定要删除这个标签吗？此操作无法撤销。</p>
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
