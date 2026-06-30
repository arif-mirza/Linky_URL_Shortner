import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Sora } from 'next/font/google';
import { Header } from '@/components';
import { Providers } from '@/store';
import './globals.css';

const bodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
});

const headingFont = Sora({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Linkly',
  description: 'Shorten Your Loooong Links :)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={headingFont.variable}>
      <body className={`${bodyFont.className} min-h-screen text-[#C9CED6]`}>
        <Providers>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Header />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
