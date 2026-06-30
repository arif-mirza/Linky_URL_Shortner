import { randomUUID } from 'node:crypto';
import {
  countLinksByOwner,
  deleteLinkByOwner,
  findLinkByCode,
  findOwnerLinkByOriginalUrl,
  incrementClicksAndResolve,
  insertLink,
  listLinksByOwner,
  transferGuestLinksToUser,
  updateLinkByOwner,
} from '@/api/server/db';
import type { LinkItem, LinkStatus } from '@/types';

const DEFAULT_APP_URL = 'http://localhost:3000';

function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  const normalized = configured?.trim().replace(/\/+$/, '');
  return normalized || DEFAULT_APP_URL;
}

function toLinkDto(item: {
  id: string;
  code: string;
  originalUrl: string;
  clicks: number;
  status: LinkStatus;
  createdAt: string;
}): LinkItem {
  const shortUrl = `/s/${item.code}`;
  const absoluteShortUrl = `${getAppUrl()}${shortUrl}`;
  return {
    id: item.id,
    code: item.code,
    originalUrl: item.originalUrl,
    clicks: item.clicks,
    status: item.status,
    createdAt: item.createdAt,
    shortUrl,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(absoluteShortUrl)}`,
  };
}

function randomCode(size = 7): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: size }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function listLinks(ownerId: string): Promise<LinkItem[]> {
  const links = await listLinksByOwner(ownerId);
  return links.map(toLinkDto);
}

export async function createLink(payload: {
  originalUrl: string;
  ownerId: string;
  guestLimit?: number;
}): Promise<LinkItem> {
  const normalizedUrl = new URL(payload.originalUrl).toString();

  if (typeof payload.guestLimit === 'number') {
    const ownerCount = await countLinksByOwner(payload.ownerId);
    if (ownerCount >= payload.guestLimit) {
      throw new Error(`Guest limit reached. You can shorten up to ${payload.guestLimit} links before login.`);
    }
  }

  const duplicate = await findOwnerLinkByOriginalUrl(payload.ownerId, normalizedUrl);
  if (duplicate) {
    throw new Error('This URL has already been shortened in your account.');
  }

  let code = randomCode();
  while (await findLinkByCode(code)) {
    code = randomCode();
  }

  const record = {
    id: randomUUID(),
    code,
    originalUrl: normalizedUrl,
    clicks: 0,
    status: 'Active' as LinkStatus,
    createdAt: new Date().toISOString(),
    userId: payload.ownerId,
  };

  await insertLink(record);
  return toLinkDto(record);
}

export async function updateLink(
  id: string,
  payload: { originalUrl?: string; status?: LinkStatus },
  ownerId: string,
): Promise<LinkItem> {
  const normalizedOriginalUrl = payload.originalUrl ? new URL(payload.originalUrl).toString() : undefined;
  const updated = await updateLinkByOwner(id, ownerId, {
    originalUrl: normalizedOriginalUrl,
    status: payload.status,
  });

  if (!updated) {
    throw new Error('Link not found');
  }

  return toLinkDto(updated);
}

export async function deleteLink(id: string, ownerId: string): Promise<string> {
  const removed = await deleteLinkByOwner(id, ownerId);
  if (!removed) {
    throw new Error('Link not found');
  }

  return id;
}

export async function resolveCode(code: string): Promise<string | null> {
  return incrementClicksAndResolve(code);
}

export async function migrateGuestLinks(guestId: string, userId: string): Promise<void> {
  await transferGuestLinksToUser(guestId, userId);
}
