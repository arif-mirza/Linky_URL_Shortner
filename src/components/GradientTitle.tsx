import type { ReactNode } from 'react';

interface GradientTitleProps {
  children?: ReactNode;
  centered?: boolean;
  size?: 'lg' | 'xl';
}

export function GradientTitle({
  children = 'Shorten Your Loooong Links :)',
  centered = true,
  size = 'xl',
}: GradientTitleProps) {
  return (
    <h1
      style={{ fontFamily: 'var(--font-heading)' }}
      className={`${centered ? 'text-center' : ''} ${size === 'xl' ? 'text-[2.35rem] leading-[1.08] md:text-6xl' : 'text-[2rem] leading-[1.1] md:text-5xl'} font-black tracking-tight`}
    >
      <span className="bg-linear-to-r from-[#2f6dff] via-[#f15bb5] to-[#2b57e8] bg-clip-text text-transparent">
        {children}
      </span>
    </h1>
  );
}
