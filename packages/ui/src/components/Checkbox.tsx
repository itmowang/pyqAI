import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="flex items-center cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className={clsx(
              'w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500',
              className
            )}
            {...props}
          />
          {label && (
            <span className="ml-2 text-sm text-gray-700">{label}</span>
          )}
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
