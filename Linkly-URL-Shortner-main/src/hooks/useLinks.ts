"use client";

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useStore';
import { createLinkThunk, deleteLinkThunk, fetchLinksThunk, updateLinkThunk } from '@/store';
import type { LinkItem, LinkStatus } from '@/types';

function toAbsoluteShortUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, window.location.origin).toString();
}

export function useLinks() {
  const dispatch = useAppDispatch();
  const links = useAppSelector((state) => state.links);

  const loadLinks = useCallback(async () => {
    await dispatch(fetchLinksThunk());
  }, [dispatch]);

  const shortenLink = async (originalUrl: string) => {
    const result = await dispatch(createLinkThunk(originalUrl)).unwrap();
    return result.link as LinkItem;
  };

  const deleteLink = async (id: string) => {
    await dispatch(deleteLinkThunk(id)).unwrap();
  };

  const toggleStatus = async (id: string, current: LinkStatus) => {
    const next: LinkStatus = current === 'Active' ? 'Inactive' : 'Active';
    await dispatch(updateLinkThunk({ id, status: next })).unwrap();
  };

  const updateOriginalUrl = async (id: string, originalUrl: string) => {
    await dispatch(updateLinkThunk({ id, originalUrl })).unwrap();
  };

  const copyShortUrl = async (link: LinkItem): Promise<boolean> => {
    const absoluteShortUrl = toAbsoluteShortUrl(link.shortUrl);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteShortUrl);
        return true;
      }
    } catch {
      // Fallback is handled below.
    }

    try {
      const fallbackInput = document.createElement('input');
      fallbackInput.value = absoluteShortUrl;
      document.body.appendChild(fallbackInput);
      fallbackInput.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(fallbackInput);
      return copied;
    } catch {
      return false;
    }
  };

  return {
    ...links,
    loadLinks,
    shortenLink,
    deleteLink,
    toggleStatus,
    updateOriginalUrl,
    copyShortUrl,
  };
}