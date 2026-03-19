import { ReactNode, useState } from 'react';
import clsx from 'clsx';

interface Tab {
  key: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, defaultActiveKey, onChange, className }: TabsProps) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || tabs[0]?.key);

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveKey(key);
    onChange?.(key);
  };

  const activeTab = tabs.find(tab => tab.key === activeKey);

  return (
    <div className={clsx('w-full', className)}>
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key, tab.disabled)}
              disabled={tab.disabled}
              className={clsx(
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeKey === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-4">{activeTab?.content}</div>
    </div>
  );
};
