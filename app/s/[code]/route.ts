import { NextResponse } from 'next/server';
import { resolveCode } from '@/api/server';

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const url = await resolveCode(code);

  if (!url) {
    return NextResponse.json({ error: 'Short link not found' }, { status: 404 });
  }

  return NextResponse.redirect(url);
}
