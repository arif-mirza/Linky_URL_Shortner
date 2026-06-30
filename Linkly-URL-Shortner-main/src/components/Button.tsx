'use client';

import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Variant = 'primary' | 'ghost' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#144EE3] hover:bg-[#2960ea] text-white shadow-[0_8px_24px_rgba(20,78,227,0.4)]',
  ghost: 'bg-transparent hover:bg-white/5 text-slate-200',
  outline: 'border border-[#293B67] bg-white/5 hover:bg-white/10 text-slate-200',
};

export function Button({
  children,
  className = '',
  variant = 'primary',
  fullWidth = false,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={`h-12 rounded-full px-6 text-sm font-semibold transition ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
