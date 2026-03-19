import { useState } from 'react';
import { ImageUpload, useToast } from '@blog/ui';
import api from '../lib/axios';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePostModal({ isOpen, onClose, onSuccess }: CreatePostModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    content: '',
    images: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      showToast('error', '请输入内容');
      return;
    }

    // 检查登录状态
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('error', '请先登录');
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/posts', {
        title: '朋友圈',
        content: formData.content.trim(),
        images: formData.images,
        published: true,
      });
      
      showToast('success', '发表成功！');
      setFormData({ content: '', images: [] });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('发表失败:', error);
      console.error('错误详情:', error.response);
      
      if (error.response?.status === 401) {
        showToast('error', '登录已过期，请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errorMsg = error.response?.data?.error || error.message || '发表失败，请重试';
        showToast('error', errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ content: '', images: [] });
      onClose();
    }
  };

  if (!isOpen) return null;

  const contentLength = formData.content.length;
  const maxLength = 1000;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">发朋友圈</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* 内容 - 微信风格 */}
            <div>
              <textarea
                placeholder="这一刻的想法..."
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                maxLength={maxLength}
                required
                className="w-full px-0 py-0 border-0 focus:outline-none focus:ring-0 resize-none text-base text-gray-900 placeholder-gray-400"
                style={{ fontSize: '16px', lineHeight: '1.6' }}
              />
              <div className="flex justify-end mt-2">
                <span className={`text-sm ${contentLength > maxLength * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                  {contentLength}/{maxLength}
                </span>
              </div>
            </div>

            {/* 图片 */}
            <div>
              <ImageUpload
                value={formData.images}
                onChange={(images) => setFormData({ ...formData, images })}
                maxCount={9}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {formData.images.length > 0 && `已选择 ${formData.images.length} 张图片`}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-10 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 font-medium text-base"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.content.trim()}
                className="px-12 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
              >
                {isSubmitting ? '发表中...' : '发表'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
