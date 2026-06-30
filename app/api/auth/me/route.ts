import { NextResponse } from 'next/server';
import { API_HEADERS } from '@/constants';
import { getUserFromToken } from '@/api/server';

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

export async function GET(request: Request) {
  const token = extractToken(request);
  const user = await getUserFromToken(token);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
