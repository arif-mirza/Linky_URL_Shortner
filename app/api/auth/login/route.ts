import { NextResponse } from 'next/server';
import { loginUser, migrateGuestLinks } from '@/api/server';
import { API_HEADERS } from '@/constants';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; password?: string };

    if (!payload.email || !payload.password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const result = await loginUser({ email: payload.email, password: payload.password });

    const guestId = request.headers.get(API_HEADERS.guestId);
    if (guestId) {
      await migrateGuestLinks(guestId, result.user.id);
    }

    return NextResponse.json({ user: result.user, token: result.token });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to login' },
      { status: 401 },
    );
  }
}
