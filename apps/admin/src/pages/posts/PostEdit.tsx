import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Card,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Form,
  FormItem,
  FormActions,
  ImageUpload,
  useToast,
  Loading,
} from '@blog/ui';
import api from '../../lib/axios';

export default function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    images: [] as string[],
    tagIds: [] as string[],
    published: false,
  });

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const response: any = await api.get(`/posts/${id}`);
      return response.data;
    },
  });

  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response: any = await api.get('/tags');
      return response.data;
    },
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        images: post.images || [],
        tagIds: post.tags.map((tag: any) => tag.id),
        published: post.published,
      });
    }
  }, [post]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.put(`/posts/${id}`, data),
    onSuccess: () => {
      showToast('success', '文章更新成功！');
      navigate('/posts');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.error || '更新失败');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (postLoading || tagsLoading) {
    return <Loading text="加载中..." />;
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/posts')}>
          ← 返回
        </Button>
      </div>

      <Card padding="lg" className="bg-white border border-gray-200">
        <Form onSubmit={handleSubmit}>
          <FormItem label="标题" required>
            <Input
              placeholder="请输入文章标题"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </FormItem>

          <FormItem label="内容" required>
            <Textarea
              placeholder="请输入文章内容"
              rows={12}
              showCount
              maxLength={10000}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </FormItem>

          <FormItem label="图片">
            <ImageUpload
              value={formData.images}
              onChange={images => setFormData({ ...formData, images })}
              maxCount={9}
            />
          </FormItem>

          <FormItem label="标签">
            <Select
              placeholder="选择标签（可选）"
              options={
                tags?.map((tag: any) => ({
                  value: tag.id,
                  label: tag.name,
                })) || []
              }
              value={formData.tagIds[0] || ''}
              onChange={e => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  tagIds: value ? [value] : [],
                });
              }}
            />
          </FormItem>

          <FormItem>
            <Checkbox
              label="发布文章"
              checked={formData.published}
              onChange={e => setFormData({ ...formData, published: e.target.checked })}
            />
          </FormItem>

          <FormActions>
            <Button variant="outline" onClick={() => navigate('/posts')}>
              取消
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? '保存中...' : '保存修改'}
            </Button>
          </FormActions>
        </Form>
      </Card>
    </div>
  );
}
