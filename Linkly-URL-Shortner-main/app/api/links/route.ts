import { NextResponse } from 'next/server';
import { APP_LIMITS, API_HEADERS } from '@/constants';
import { createLink, getUserFromToken, listLinks } from '@/api/server';

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

async function resolveOwner(request: Request): Promise<{
  ownerId: string;
  isGuest: boolean;
}> {
  const token = extractToken(request);
  const user = await getUserFromToken(token);

  if (user) {
    return { ownerId: user.id, isGuest: false };
  }

  const guestId = request.headers.get(API_HEADERS.guestId);
  if (guestId) {
    return { ownerId: guestId, isGuest: true };
  }

  throw new Error('Guest id is missing');
}

export async function GET(request: Request) {
  try {
    const owner = await resolveOwner(request);
    const links = await listLinks(owner.ownerId);
    return NextResponse.json({ links });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to fetch links' },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { originalUrl?: string };
    if (!payload.originalUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(payload.originalUrl);
    } catch {
      return NextResponse.json({ error: 'Provide a valid URL' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 });
    }

    const owner = await resolveOwner(request);
    const link = await createLink({
      originalUrl: payload.originalUrl,
      ownerId: owner.ownerId,
      guestLimit: owner.isGuest ? APP_LIMITS.guestLinkLimit : undefined,
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create short link' },
      { status: 401 },
    );
  }
}
