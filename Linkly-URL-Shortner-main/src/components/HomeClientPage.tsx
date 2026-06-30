'use client';

import { BarChart3, Clock3, Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { HeroShortener, HistoryTable } from '@/components';
import { useAuth, useLinks } from '@/hooks';

type DashboardTab = 'history' | 'statistics' | 'settings';

export function HomeClientPage() {
  const { loadLinks, items, isLoading } = useLinks();
  const { initialized, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('history');

  const metrics = useMemo(() => {
    const totalLinks = items.length;
    const activeLinks = items.filter((item) => item.status === 'Active').length;
    const inactiveLinks = totalLinks - activeLinks;
    const totalClicks = items.reduce((sum, item) => sum + item.clicks, 0);
    return { totalLinks, activeLinks, inactiveLinks, totalClicks };
  }, [items]);

  const exportCsv = () => {
    if (!items.length) {
      return;
    }

    const header = ['Short URL', 'Original URL', 'Status', 'Clicks', 'Created At'];
    const rows = items.map((item) => [
      item.shortUrl,
      item.originalUrl,
      item.status,
      String(item.clicks),
      item.createdAt,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'linkly-history.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  if (!initialized) {
    return <section className="mx-auto min-h-[calc(100vh-150px)] w-full max-w-6xl px-3 py-8" />;
  }

  return (
    <>
      <HeroShortener />

      {isAuthenticated && (
        <section className="mt-3 border-y border-[#1B2742] bg-[#121a2d]/70">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-4 overflow-x-auto px-4 py-3 text-sm text-[#96a8cd] md:gap-8">
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 pb-2 transition ${
                activeTab === 'history'
                  ? 'border-[#2f6dff] font-semibold text-[#d8e4ff]'
                  : 'border-transparent hover:text-white'
              }`}
            >
              <Clock3 size={14} />
              History
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('statistics')}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 pb-2 transition ${
                activeTab === 'statistics'
                  ? 'border-[#2f6dff] font-semibold text-[#d8e4ff]'
                  : 'border-transparent hover:text-white'
              }`}
            >
              <BarChart3 size={14} />
              Statistics
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 pb-2 transition ${
                activeTab === 'settings'
                  ? 'border-[#2f6dff] font-semibold text-[#d8e4ff]'
                  : 'border-transparent hover:text-white'
              }`}
            >
              <Settings size={14} />
              Settings
            </button>
          </div>
        </section>
      )}

      {activeTab === 'history' && <HistoryTable />}

      {isAuthenticated && activeTab === 'statistics' && (
        <section className="mx-auto mt-10 w-full max-w-6xl px-3 pb-16 md:mt-14">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-[#1E2A45] bg-[#121B2D]/90 p-5">
              <p className="text-xs uppercase tracking-wide text-[#8ea1ca]">Total Links</p>
              <p className="mt-2 text-3xl font-semibold text-[#e3ebff]">{metrics.totalLinks}</p>
            </div>
            <div className="rounded-2xl border border-[#1E2A45] bg-[#121B2D]/90 p-5">
              <p className="text-xs uppercase tracking-wide text-[#8ea1ca]">Active</p>
              <p className="mt-2 text-3xl font-semibold text-[#21c06f]">{metrics.activeLinks}</p>
            </div>
            <div className="rounded-2xl border border-[#1E2A45] bg-[#121B2D]/90 p-5">
              <p className="text-xs uppercase tracking-wide text-[#8ea1ca]">Inactive</p>
              <p className="mt-2 text-3xl font-semibold text-[#d4b02e]">{metrics.inactiveLinks}</p>
            </div>
            <div className="rounded-2xl border border-[#1E2A45] bg-[#121B2D]/90 p-5">
              <p className="text-xs uppercase tracking-wide text-[#8ea1ca]">Total Clicks</p>
              <p className="mt-2 text-3xl font-semibold text-[#e3ebff]">{metrics.totalClicks}</p>
            </div>
          </div>
        </section>
      )}

      {isAuthenticated && activeTab === 'settings' && (
        <section className="mx-auto mt-10 w-full max-w-6xl px-3 pb-16 md:mt-14">
          <div className="rounded-2xl border border-[#1E2A45] bg-[#121B2D]/90 p-6">
            <h3 className="text-lg font-semibold text-[#e4ebff]">Workspace Settings</h3>
            <p className="mt-2 text-sm text-[#9fb0d6]">Use these actions to manage your links view.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  void loadLinks();
                }}
                className="rounded-full border border-[#2B3D66] px-4 py-2 text-sm text-[#c9d7f7] hover:bg-white/10"
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh Links'}
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="rounded-full border border-[#2B3D66] px-4 py-2 text-sm text-[#c9d7f7] hover:bg-white/10"
                disabled={!items.length}
              >
                Export CSV
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
