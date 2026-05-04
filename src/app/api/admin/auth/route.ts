import { NextResponse } from 'next/server';

/**
 * POST /api/admin/auth
 * Validates password and sets a session cookie.
 */
export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD not configured' }, { status: 500 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  // Set a simple session flag instead of the password itself to avoid encoding issues
  response.cookies.set('admin_session', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}

/**
 * DELETE /api/admin/auth
 * Clears the session cookie (logout).
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}
