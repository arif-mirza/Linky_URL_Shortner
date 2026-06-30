'use client';

import Link from 'next/link';
import { Bell, ChevronDown, Link2, LogIn } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BrandLogo, Button } from '@/components';
import { useAuth, useLinks } from '@/hooks';

const AUTH_PAGES = new Set(['/login', '/register', '/forget', '/reset']);

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New click activity on your short links', read: false },
    { id: '2', title: 'Your history has been synced', read: false },
  ]);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const {
    bootstrapSession,
    initialized,
    isAuthenticated,
    isLoading,
    user,
    performLogout,
  } = useAuth();
  const { shortenLink, isSubmitting } = useLinks();
  const [quickUrl, setQuickUrl] = useState('');

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    if (!isMenuOpen && !isNotificationsOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const targetNode = event.target as Node;

      if (menuRef.current && !menuRef.current.contains(targetNode)) {
        setIsMenuOpen(false);
      }

      if (notificationsRef.current && !notificationsRef.current.contains(targetNode)) {
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [isMenuOpen, isNotificationsOpen]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const onQuickShorten = async () => {
    const trimmed = quickUrl.trim();
    if (!trimmed) {
      return;
    }

    try {
      await shortenLink(trimmed);
      setQuickUrl('');
    } catch {
      // Error surface is handled by links slice and visible in page UI.
    }
  };

  if (AUTH_PAGES.has(pathname)) {
    return (
      <header className="flex items-center justify-center py-8 md:py-10">
        <BrandLogo size="lg" centered />
      </header>
    );
  }

  if (!initialized) {
    return <header className="h-21" />;
  }

  return (
    <header className="flex items-center justify-between gap-3 py-5 lg:gap-5 lg:py-7">
      <BrandLogo />

      {!isAuthenticated ? (
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-[#2B3D66] bg-white/5 px-5 text-sm font-semibold text-[#dae2f4] transition hover:bg-white/10 focus:outline-none"
          >
            Login
            <LogIn size={15} />
          </Link>
          <Link href="/register" className="hidden md:inline-flex">
            <Button className="min-w-36.25">Register Now</Button>
          </Link>
        </div>
      ) : (
        <>
          {pathname === '/' && (
            <div className="hidden flex-1 lg:block">
              <div className="relative mx-auto flex w-full max-w-3xl items-center rounded-[34px] border border-[#2B3D66] bg-[#151E31]/90 p-1.5 shadow-[0_8px_28px_rgba(0,20,60,0.35)]">
                <div className="pl-3 pr-2 text-[#8194bc]">
                  <Link2 size={16} />
                </div>
                <input
                  value={quickUrl}
                  onChange={(event) => setQuickUrl(event.target.value)}
                  placeholder="Enter the link here"
                  className="h-10 flex-1 bg-transparent text-sm text-[#D2D9EA] outline-none placeholder:text-[#7282a7]"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void onQuickShorten();
                    }
                  }}
                />
                <Button
                  className="h-10 min-w-28 px-4 text-sm"
                  onClick={() => {
                    void onQuickShorten();
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '...' : 'Shorten Now!'}
                </Button>
              </div>
            </div>
          )}

          <div className="flex shrink-0 items-center gap-3">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-[#344d81] bg-[#18253c]/90 px-4 text-[#d7dff1] focus:outline-none md:h-14 md:gap-3 md:px-5"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="Open user menu"
            >
              <div className="text-left leading-tight">
                <p className="text-[11px] text-[#b5c3de]">Welcome</p>
                <p className="max-w-24 truncate text-xl font-semibold text-[#f0f5ff] md:max-w-36 md:text-2xl">{user?.name}</p>
              </div>
              <ChevronDown size={15} className={`text-[#8ea0c7] transition ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border border-[#2B3D66] bg-[#111b30] shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    void performLogout();
                  }}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#dbe5ff] transition hover:bg-white/10 disabled:opacity-60"
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen((open) => !open);
                setNotifications((current) => current.map((item) => ({ ...item, read: true })));
              }}
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1f56e5] text-white shadow-[0_0_18px_rgba(31,86,229,0.55)] focus:outline-none md:h-14 md:w-14"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[#1f56e5] bg-[#0d2f82] px-1 text-[11px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-xl border border-[#2B3D66] bg-[#111b30] shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                <div className="border-b border-[#253659] px-4 py-3 text-sm font-semibold text-[#dbe5ff]">
                  Notifications
                </div>
                <ul className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <li key={notification.id} className="border-b border-[#1d2b47] px-4 py-3 text-sm text-[#b8c7e8] last:border-b-0">
                      {notification.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </header>
  );
}
