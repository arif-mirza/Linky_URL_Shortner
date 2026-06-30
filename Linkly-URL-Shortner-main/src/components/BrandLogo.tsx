import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
  centered?: boolean;
  size?: 'md' | 'lg';
}

export function BrandLogo({ href = '/', centered = false, size = 'md' }: BrandLogoProps) {
  const textSize = size === 'lg' ? 'text-5xl md:text-6xl' : 'text-4xl md:text-5xl';

  return (
    <Link
      href={href}
      style={{ fontFamily: 'var(--font-heading)' }}
      className={`${centered ? 'mx-auto' : ''} inline-flex items-start gap-1 leading-none font-black tracking-tight ${textSize}`}
      aria-label="Linkly Home"
    >
      <span className="bg-linear-to-r from-[#f15bb5] to-[#2f6dff] bg-clip-text text-transparent">
        Linkly
      </span>
      <sup className="mt-1 text-xs text-[#8ea0c7]">R</sup>
    </Link>
  );
}
