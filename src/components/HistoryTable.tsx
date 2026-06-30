'use client';

import { Check, ChevronDown, ChevronUp, Copy, Link2, LoaderCircle, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth, useLinks } from '@/hooks';
import type { LinkItem } from '@/types';

type StatusFilter = 'All' | 'Active' | 'Inactive';
type SortFilter = 'Newest' | 'Oldest' | 'Most Clicks';

function formatDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function rowStatusClass(status: LinkItem['status']): string {
  return status === 'Active' ? 'text-[#21c06f]' : 'text-[#d4b02e]';
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'link';
  }
}

function faviconUrl(url: string): string {
  const domain = domainFromUrl(url);
  return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`;
}

export function HistoryTable() {
  const { isAuthenticated } = useAuth();
  const { items, isLoading, copyShortUrl, deleteLink, toggleStatus, updateOriginalUrl } = useLinks();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftOriginalUrl, setDraftOriginalUrl] = useState('');
  const [draftStatus, setDraftStatus] = useState<LinkItem['status']>('Active');
  const [pendingDelete, setPendingDelete] = useState<LinkItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortFilter, setSortFilter] = useState<SortFilter>('Newest');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isFilterOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!filterRef.current) {
        return;
      }
      if (!filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [isFilterOpen]);

  const rows = useMemo(() => {
    const filtered =
      statusFilter === 'All' ? items : items.filter((item) => item.status === statusFilter);

    const sorted = [...filtered];
    if (sortFilter === 'Most Clicks') {
      sorted.sort((a, b) => b.clicks - a.clicks);
      return sorted;
    }

    sorted.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortFilter === 'Newest' ? bTime - aTime : aTime - bTime;
    });

    return sorted;
  }, [items, sortFilter, statusFilter]);

  const handleCopy = async (item: LinkItem) => {
    const copied = await copyShortUrl(item);
    if (!copied) {
      return;
    }

    setCopiedId(item.id);
    setTimeout(() => setCopiedId((current) => (current === item.id ? null : current)), 1200);
  };

  const startEdit = (item: LinkItem) => {
    setEditingId(item.id);
    setDraftOriginalUrl(item.originalUrl);
    setDraftStatus(item.status);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftOriginalUrl('');
    setDraftStatus('Active');
  };

  const saveEdit = async (item: LinkItem) => {
    const nextUrl = draftOriginalUrl.trim();
    const hasUrlChange = !!nextUrl && nextUrl !== item.originalUrl;
    const hasStatusChange = draftStatus !== item.status;

    if (!hasUrlChange && !hasStatusChange) {
      cancelEdit();
      return;
    }

    try {
      setIsSaving(true);
      if (hasUrlChange) {
        await updateOriginalUrl(item.id, nextUrl);
      }
      if (hasStatusChange) {
        await toggleStatus(item.id, item.status);
      }
      cancelEdit();
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = (item: LinkItem) => {
    setPendingDelete(item);
  };

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteLink(pendingDelete.id);
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="mx-auto mt-10 w-full max-w-6xl px-3 pb-16 md:mt-14">
      <div className="relative rounded-2xl bg-[#121B2D]/90 shadow-[0_14px_40px_rgba(1,7,20,0.45)]">
        <div className="hidden items-center justify-between border-b border-[#1B2742] px-6 py-5 lg:flex">
          <h2 className="text-xl font-semibold text-[#dbe3f7]">History ({rows.length})</h2>
          {isAuthenticated ? (
            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen((open) => !open)}
                className={`rounded-full border px-5 py-2 text-sm transition focus:outline-none ${
                  isFilterOpen
                    ? 'border-[#dbe5ff] text-[#dbe5ff]'
                    : 'border-[#2B3D66] text-[#9fb0d6] hover:bg-white/10'
                }`}
              >
                Filter
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-[#2B3D66] bg-[#111b30] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#93a8d3]">Status</p>
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    {(['All', 'Active', 'Inactive'] as StatusFilter[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-md px-2 py-1 text-xs ${
                          statusFilter === status
                            ? 'bg-[#1f4fd0] text-white'
                            : 'bg-[#17233b] text-[#a8b7d7] hover:bg-[#1d2a45]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#93a8d3]">Sort</p>
                  <div className="mt-2 max-h-40 space-y-1 overflow-y-auto pr-1">
                    {(['Newest', 'Oldest', 'Most Clicks'] as SortFilter[]).map((sort) => (
                      <button
                        key={sort}
                        type="button"
                        onClick={() => setSortFilter(sort)}
                        className={`w-full rounded-md px-2 py-1 text-left text-xs ${
                          sortFilter === sort
                            ? 'bg-[#1f4fd0] text-white'
                            : 'bg-[#17233b] text-[#a8b7d7] hover:bg-[#1d2a45]'
                        }`}
                      >
                        {sort}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className="rounded-full border border-[#2B3D66] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#9fb0d6]">
              Manage Links
            </span>
          )}
        </div>

        <div className="border-b border-[#1B2742] px-5 py-4 lg:hidden">
          <h2 className="text-sm font-semibold text-[#dbe3f7]">Shorten Links</h2>
        </div>

        <div className="lg:hidden">
          <ul className="divide-y divide-[#1B2742] bg-[#0F1727]">
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <li key={`mobile-loading-${index}`} className="animate-pulse px-5 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-4 w-36 rounded bg-[#1B2742]" />
                    <div className="h-8 w-8 rounded-full bg-[#1B2742]" />
                  </div>
                </li>
              ))}

            {!isLoading && rows.length === 0 && (
              <li className="px-5 py-6 text-sm text-[#8fa0c6]">
                {items.length ? 'No links matched your selected filters.' : 'No links available yet. Create your first one above.'}
              </li>
            )}

            {!isLoading &&
              rows.map((item) => {
                const expanded = expandedId === item.id;
                return (
                  <li key={`mobile-${item.id}`} className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <a
                        href={item.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 truncate text-sm text-[#adc0e9]"
                      >
                        {item.shortUrl}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          void handleCopy(item);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#19253e] text-[#9fb0d6]"
                        aria-label="Copy short link"
                      >
                        {copiedId === item.id ? <Check size={14} className="text-[#21c06f]" /> : <Copy size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#19253e] text-[#9fb0d6]"
                        aria-label="Toggle row details"
                      >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {expanded && (
                      <div className="mt-3 space-y-2 rounded-xl border border-[#1B2742] bg-[#121b2d] p-3 text-xs">
                        {editingId === item.id ? (
                          <>
                            <input
                              value={draftOriginalUrl}
                              onChange={(event) => setDraftOriginalUrl(event.target.value)}
                              className="h-8 w-full border-0 border-b border-[#2B3D66] bg-transparent px-1 text-xs text-[#dbe3f7] outline-none focus:border-[#3f7cff]"
                            />
                            <div className="flex items-center justify-between">
                              <select
                                value={draftStatus}
                                onChange={(event) => setDraftStatus(event.target.value as LinkItem['status'])}
                                className="h-8 border-0 border-b border-[#2B3D66] bg-transparent px-1 text-xs text-[#dbe3f7] outline-none"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#2f4e8f] bg-[#173677] text-[#cfe0ff]"
                                  onClick={() => {
                                    void saveEdit(item);
                                  }}
                                  disabled={isSaving}
                                  aria-label="Save changes"
                                >
                                  {isSaving ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />}
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#2B3D66] text-[#9fb0d6]"
                                  onClick={cancelEdit}
                                  aria-label="Cancel editing"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="truncate text-[#9fb0d6]">{item.originalUrl}</p>
                            <div className="flex items-center justify-between text-[#8ea1ca]">
                              <span>Clicks: {item.clicks}</span>
                              <button
                                type="button"
                                onClick={() => toggleStatus(item.id, item.status)}
                                className={rowStatusClass(item.status)}
                              >
                                {item.status}
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#8ea1ca]">{formatDate(item.createdAt)}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="rounded-full border border-[#2B3D66] p-1.5 text-[#9fb0d6]"
                                  onClick={() => startEdit(item)}
                                  aria-label="Edit"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="rounded-full border border-[#2B3D66] p-1.5 text-[#9fb0d6]"
                                  onClick={() => requestDelete(item)}
                                  aria-label="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-215 text-left text-sm">
            <thead className="border-b border-[#1B2742] bg-[#101828] text-[#9fb0d6]">
              <tr>
                <th className="px-6 py-4">Short Link</th>
                <th className="px-6 py-4">Original Link</th>
                <th className="px-6 py-4">QR Code</th>
                <th className="px-6 py-4">Clicks</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2742] bg-[#0F1727]">
              {isLoading && (
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <tr key={`loading-row-${index}`} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="h-4 w-28 rounded bg-[#1B2742]" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-64 rounded bg-[#1B2742]" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-11 w-11 rounded bg-[#1B2742]" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-8 rounded bg-[#1B2742]" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-20 rounded bg-[#1B2742]" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-24 rounded bg-[#1B2742]" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="ml-auto h-8 w-20 rounded bg-[#1B2742]" />
                      </td>
                    </tr>
                  ))}
                </>
              )}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-[#8fa0c6]" colSpan={7}>
                    {items.length ? 'No links matched your selected filters.' : 'No links available yet. Create your first one above.'}
                  </td>
                </tr>
              )}
              {rows.map((item) => (
                <tr key={item.id} className="text-[#c7d1e8]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={item.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="max-w-55 truncate text-[#adc0e9] underline-offset-2 hover:underline"
                      >
                        {item.shortUrl}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          void handleCopy(item);
                        }}
                        className="rounded-lg bg-[#19253e] p-1.5 text-[#9fb0d6] hover:text-white"
                        aria-label="Copy short link"
                      >
                        {copiedId === item.id ? <Check size={14} className="text-[#21c06f] animate-pulse" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={draftOriginalUrl}
                          onChange={(event) => setDraftOriginalUrl(event.target.value)}
                          className="h-9 w-full max-w-70 border-0 border-b border-[#2B3D66] bg-transparent px-1 text-sm text-[#dbe3f7] outline-none focus:border-[#3f7cff]"
                          placeholder="https://example.com"
                        />
                      </div>
                    ) : (
                      <span className="inline-flex max-w-70 items-center gap-2 truncate text-[#a0afcf]">
                        <Image
                          src={faviconUrl(item.originalUrl)}
                          alt={`${domainFromUrl(item.originalUrl)} favicon`}
                          width={18}
                          height={18}
                          className="h-4.5 w-4.5 rounded-sm"
                        />
                        {item.originalUrl}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <a href={item.qrCodeUrl} target="_blank" rel="noreferrer">
                      <Image
                        src={item.qrCodeUrl}
                        alt={`QR for ${item.shortUrl}`}
                        width={44}
                        height={44}
                        className="rounded-md border border-[#2B3D66] bg-white/5 p-1"
                      />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-[#8ea1ca]">{item.clicks}</td>
                  <td className="px-6 py-4">
                    {editingId === item.id ? (
                      <select
                        value={draftStatus}
                        onChange={(event) => setDraftStatus(event.target.value as LinkItem['status'])}
                        className="h-9 border-0 border-b border-[#2B3D66] bg-transparent px-1 text-sm text-[#dbe3f7] outline-none focus:border-[#3f7cff]"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleStatus(item.id, item.status)}
                        className={`${rowStatusClass(item.status)} inline-flex items-center gap-2`}
                      >
                        <Link2 size={14} />
                        {item.status}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#8ea1ca]">{formatDate(item.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {editingId === item.id ? (
                        <>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2f4e8f] bg-[#173677] text-[#cfe0ff] disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => {
                              void saveEdit(item);
                            }}
                            disabled={isSaving}
                            aria-label="Save changes"
                          >
                            {isSaving ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={16} />}
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2B3D66] text-[#9fb0d6] hover:text-white"
                            onClick={cancelEdit}
                            disabled={isSaving}
                            aria-label="Cancel editing"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="rounded-full border border-[#2B3D66] p-2 text-[#9fb0d6] hover:text-white"
                            onClick={() => startEdit(item)}
                            aria-label="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDelete(item)}
                            className="rounded-full border border-[#2B3D66] p-2 text-[#9fb0d6] hover:text-[#ef6a6a]"
                            aria-label="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isAuthenticated && (
          <div className="px-6 py-5 text-center text-sm text-[#8fa0c6]">
            <Link href="/register" className="font-semibold text-[#3f7cff] underline">
              Register now
            </Link>{' '}
            to keep your links synced with your account.
          </div>
        )}
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040813]/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#263556] bg-[#0f1728] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.55)]">
            <h3 className="text-lg font-semibold text-[#e4ebff]">Delete short URL?</h3>
            <p className="mt-3 text-sm text-[#9fb0d6]">
              This will permanently remove <span className="text-[#dbe3f7]">{pendingDelete.shortUrl}</span> from your history.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-lg border border-[#2B3D66] px-4 py-2 text-sm text-[#9fb0d6]"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void confirmDelete();
                }}
                className="rounded-lg bg-[#d84747] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle size={14} className="animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
