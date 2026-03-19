import { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Card,
  Badge,
  Avatar,
  Modal,
  Loading,
  ToastProvider,
  useToast,
  Pagination,
  Tabs,
  Empty,
  Form,
  FormItem,
  FormActions,
  ImageUpload,
} from '../../src';

function DemoContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const { showToast } = useToast();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">UI 组件库</h1>
          <p className="text-gray-600">基于 Tailwind CSS 的 React 组件</p>
        </header>

        {/* Buttons */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">按钮 Button</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">主要按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="outline">边框按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
            <Button variant="primary" disabled>
              禁用按钮
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button size="sm">小按钮</Button>
            <Button size="md">中按钮</Button>
            <Button size="lg">大按钮</Button>
          </div>
        </Card>

        {/* Form Components */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">表单组件</h2>
          <Form className="space-y-4">
            <FormItem label="用户名" required>
              <Input placeholder="请输入用户名" />
            </FormItem>

            <FormItem label="邮箱">
              <Input type="email" placeholder="请输入邮箱" />
            </FormItem>

            <FormItem label="分类">
              <Select
                placeholder="请选择分类"
                options={[
                  { value: '1', label: '技术' },
                  { value: '2', label: '生活' },
                  { value: '3', label: '随笔' },
                ]}
              />
            </FormItem>

            <FormItem label="简介">
              <Textarea
                placeholder="请输入简介"
                rows={4}
                showCount
                maxLength={200}
              />
            </FormItem>

            <FormItem>
              <Checkbox label="同意用户协议" />
            </FormItem>

            <FormActions>
              <Button variant="outline">取消</Button>
              <Button variant="primary">提交</Button>
            </FormActions>
          </Form>
        </Card>

        {/* Image Upload */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">图片上传 ImageUpload</h2>
          <ImageUpload value={images} onChange={setImages} maxCount={9} />
        </Card>

        {/* Badges & Avatars */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">徽章 & 头像</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">默认</Badge>
              <Badge variant="primary">主要</Badge>
              <Badge variant="success">成功</Badge>
              <Badge variant="warning">警告</Badge>
              <Badge variant="danger">危险</Badge>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Avatar size="sm" fallback="小" />
              <Avatar size="md" fallback="中" />
              <Avatar size="lg" fallback="大" />
              <Avatar size="xl" fallback="超大" />
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">标签页 Tabs</h2>
          <Tabs
            tabs={[
              {
                key: '1',
                label: '全部',
                content: <div className="p-4">全部内容</div>,
              },
              {
                key: '2',
                label: '已发布',
                content: <div className="p-4">已发布内容</div>,
              },
              {
                key: '3',
                label: '草稿',
                content: <div className="p-4">草稿内容</div>,
              },
            ]}
          />
        </Card>

        {/* Empty State */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">空状态 Empty</h2>
          <Empty
            description="暂无数据"
            action={<Button variant="primary">创建新内容</Button>}
          />
        </Card>

        {/* Pagination */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">分页 Pagination</h2>
          <Pagination
            currentPage={page}
            totalPages={10}
            onPageChange={setPage}
            showSizeChanger
            pageSize={10}
            onPageSizeChange={size => console.log('Page size:', size)}
          />
        </Card>

        {/* Modal & Toast */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">反馈组件</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsModalOpen(true)}>打开模态框</Button>
            <Button onClick={() => showToast('success', '操作成功！')}>
              成功提示
            </Button>
            <Button onClick={() => showToast('error', '操作失败！')}>
              错误提示
            </Button>
            <Button onClick={() => showToast('warning', '警告信息！')}>
              警告提示
            </Button>
            <Button onClick={() => showToast('info', '提示信息！')}>
              信息提示
            </Button>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="模态框标题"
          >
            <p>这是模态框的内容</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                确定
              </Button>
            </div>
          </Modal>
        </Card>

        {/* Loading */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">加载 Loading</h2>
          <div className="flex gap-8">
            <Loading size="sm" text="小" />
            <Loading size="md" text="中" />
            <Loading size="lg" text="大" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DemoContent />
    </ToastProvider>
  );
}
