import { ReactNode } from 'react';
import clsx from 'clsx';

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const Sidebar = ({ children, className }: SidebarProps) => {
  return (
    <aside className={clsx(
      'w-64 bg-white border-r border-gray-200',
      'flex flex-col shadow-sm',
      className
    )}>
      {children}
    </aside>
  );
};

export const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 mx-3 my-0.5 rounded-lg',
        'transition-all duration-200 text-left font-medium',
        active 
          ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
