import { FormHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

interface FormItemProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const Form = ({ children, className, ...props }: FormProps) => {
  return (
    <form className={clsx('space-y-4', className)} {...props}>
      {children}
    </form>
  );
};

export const FormItem = ({ label, error, required, children, className }: FormItemProps) => {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const FormActions = ({ children, align = 'right' }: FormActionsProps) => {
  const alignments = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={clsx('flex gap-3 pt-4', alignments[align])}>
      {children}
    </div>
  );
};
