'use client';

import type { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function FormInput({ containerClassName = '', className = '', ...props }: FormInputProps) {
  return (
    <div className={`relative ${containerClassName}`}>
      <input
        className={`h-14 w-full rounded-full border border-[#2B3D66] bg-[#151E31]/85 px-5 text-sm text-[#C9CED6] outline-none transition placeholder:text-[#7282a7] focus:border-[#3d62ba] ${className}`}
        {...props}
      />
    </div>
  );
}
