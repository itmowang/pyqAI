import { useState, useRef, ChangeEvent } from 'react';

interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  maxSize?: number;
  accept?: string;
  disabled?: boolean;
}

export const ImageUpload = ({
  value = [],
  onChange,
  maxCount = 9,
  maxSize = 5,
  accept = 'image/*',
  disabled = false,
}: ImageUploadProps) => {
  const [previews, setPreviews] = useState<string[]>(value);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError('');

    if (previews.length + files.length > maxCount) {
      setError(`最多只能上传 ${maxCount} 张图片`);
      return;
    }

    files.forEach(file => {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`图片大小不能超过 ${maxSize}MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...previews, reader.result as string];
        setPreviews(newPreviews);
        onChange?.(newPreviews);
      };
      reader.readAsDataURL(file);
    });

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onChange?.(newPreviews);
  };

  const handleAddClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 九宫格容器 - 固定3列 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {/* 已上传的图片 */}
        {previews.map((preview, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              backgroundColor: '#f3f4f6',
            }}
          >
            {/* 图片 */}
            <img
              src={preview}
              alt={`图片 ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            
            {/* 删除按钮 */}
            <div
              onClick={() => handleRemove(index)}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                zIndex: 10,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
              }}
            >
              ✕
            </div>
          </div>
        ))}

        {/* 添加按钮 - 独占一格 */}
        {previews.length < maxCount && (
          <div
            onClick={handleAddClick}
            style={{
              aspectRatio: '1',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              backgroundColor: disabled ? '#f9fafb' : '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
          >
            <svg
              style={{ width: '32px', height: '32px', color: '#9ca3af' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />

      {/* 错误提示 */}
      {error && (
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#dc2626' }}>
          {error}
        </p>
      )}
    </div>
  );
};
