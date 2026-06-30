import { NextResponse } from 'next/server';
import { registerUser, migrateGuestLinks } from '@/api/server';
import { API_HEADERS } from '@/constants';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!payload.name || !payload.email || !payload.password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const result = await registerUser({
      name: payload.name,
      email: payload.email,
      password: payload.password,
    });

    const guestId = request.headers.get(API_HEADERS.guestId);
    if (guestId) {
      await migrateGuestLinks(guestId, result.user.id);
    }

    return NextResponse.json({ user: result.user, token: result.token }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register' },
      { status: 400 },
    );
  }
}
