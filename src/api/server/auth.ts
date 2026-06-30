import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { findUserByEmail, findUserById, insertUser } from '@/api/server/db';
import type { AuthUser } from '@/types';

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET ?? 'linkly-dev-secret';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

type TokenPayload = {
  userId: string;
  expiresAt: number;
};

function toAuthUser(input: {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}): AuthUser {
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    createdAt: input.createdAt,
  };
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, savedHash] = stored.split(':');
  if (!salt || !savedHash) {
    return false;
  }
  const derived = scryptSync(password, salt, 64);
  const saved = Buffer.from(savedHash, 'hex');
  return timingSafeEqual(derived, saved);
}

function signPayload(payload: string): string {
  return createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
}

function createAuthToken(userId: string): string {
  const payload: TokenPayload = {
    userId,
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };

  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayload(encoded);
  return `${encoded}.${signature}`;
}

function verifyAuthToken(token: string): TokenPayload | null {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return null;
  }

  const expected = signPayload(encoded);
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== signatureBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as TokenPayload;
    if (!payload.userId || !payload.expiresAt) {
      return null;
    }
    if (payload.expiresAt < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: AuthUser; token: string }> {
  const normalizedEmail = payload.email.trim().toLowerCase();

  const exists = await findUserByEmail(normalizedEmail);
  if (exists) {
    throw new Error('Email is already registered');
  }

  const userRecord = {
    id: randomUUID(),
    name: payload.name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(payload.password),
    createdAt: new Date().toISOString(),
  };

  await insertUser(userRecord);

  return { user: toAuthUser(userRecord), token: createAuthToken(userRecord.id) };
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser; token: string }> {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || !verifyPassword(payload.password, user.passwordHash)) {
    throw new Error('Invalid email or password');
  }

  const token = createAuthToken(user.id);

  return { user: toAuthUser(user), token };
}

export async function getUserFromToken(token?: string): Promise<AuthUser | null> {
  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return null;
  }

  const user = await findUserById(payload.userId);
  return user ? toAuthUser(user) : null;
}
