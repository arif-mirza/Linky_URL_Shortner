import { NextResponse } from 'next/server';
import { API_HEADERS } from '@/constants';
import { deleteLink, getUserFromToken, updateLink } from '@/api/server';
import type { LinkStatus } from '@/types';

function extractToken(request: Request): string | undefined {
  const rawAuth = request.headers.get(API_HEADERS.authorization);
  if (!rawAuth) {
    return undefined;
  }
  const [scheme, value] = rawAuth.split(' ');
  if (scheme !== 'Bearer' || !value) {
    return undefined;
  }
  return value;
}

async function resolveOwnerId(request: Request): Promise<string | null> {
  const token = extractToken(request);
  const user = await getUserFromToken(token);
  if (user) {
    return user.id;
  }
  return request.headers.get(API_HEADERS.guestId) ?? null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const ownerId = await resolveOwnerId(request);
    if (!ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as { originalUrl?: string; status?: LinkStatus };
    const { id } = await context.params;

    const link = await updateLink(id, payload, ownerId);
    return NextResponse.json({ link });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update link' },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const ownerId = await resolveOwnerId(request);
    if (!ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const removedId = await deleteLink(id, ownerId);
    return NextResponse.json({ id: removedId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to delete link' },
      { status: 400 },
    );
  }
}
