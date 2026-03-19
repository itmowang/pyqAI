import clsx from 'clsx';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const Avatar = ({ src, alt, size = 'md', fallback, className }: AvatarProps) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={clsx(
        'rounded-full overflow-hidden flex items-center justify-center font-medium',
        'bg-indigo-100 text-indigo-600', // 使用品牌色作为背景
        sizes[size],
        className
      )}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt || 'Avatar'} 
          className="w-full h-full object-cover bg-indigo-100" 
        />
      ) : (
        <span>{getInitials(fallback || alt)}</span>
      )}
    </div>
  );
};
