import { Pool } from 'pg';

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type LinkRecord = {
  id: string;
  code: string;
  originalUrl: string;
  clicks: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  userId: string | null;
};

const DATABASE_URL = process.env.DATABASE_URL;

let pool: Pool | null = null;
let initialized = false;

function getPool(): Pool {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. PostgreSQL is required for this project.');
  }
  if (!pool) {
    pool = new Pool({ connectionString: DATABASE_URL });
  }
  return pool;
}
export async function ensureDb(): Promise<void> {
  if (initialized) {
    return;
  }

  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        original_url TEXT NOT NULL,
        clicks INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        user_id TEXT
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_links_code ON links(code)');
    initialized = true;
  } finally {
    client.release();
  }
}

type UserDbRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

type LinkDbRow = {
  id: string;
  code: string;
  original_url: string;
  clicks: number;
  status: 'Active' | 'Inactive';
  created_at: string;
  user_id: string | null;
};

function toUserRecord(row: UserDbRow): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

function toLinkRecord(row: LinkDbRow): LinkRecord {
  return {
    id: row.id,
    code: row.code,
    originalUrl: row.original_url,
    clicks: row.clicks,
    status: row.status,
    createdAt: row.created_at,
    userId: row.user_id,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  await ensureDb();
  const result = await getPool().query<UserDbRow>(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1',
    [email],
  );
  return result.rows[0] ? toUserRecord(result.rows[0]) : null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  await ensureDb();
  const result = await getPool().query<UserDbRow>(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE id = $1 LIMIT 1',
    [id],
  );
  return result.rows[0] ? toUserRecord(result.rows[0]) : null;
}

export async function insertUser(user: UserRecord): Promise<void> {
  await ensureDb();
  await getPool().query(
    'INSERT INTO users (id, name, email, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)',
    [user.id, user.name, user.email, user.passwordHash, user.createdAt],
  );
}

export async function listLinksByOwner(ownerId: string): Promise<LinkRecord[]> {
  await ensureDb();
  const result = await getPool().query<LinkDbRow>(
    'SELECT id, code, original_url, clicks, status, created_at, user_id FROM links WHERE user_id = $1 ORDER BY created_at DESC',
    [ownerId],
  );
  return result.rows.map(toLinkRecord);
}

export async function countLinksByOwner(ownerId: string): Promise<number> {
  await ensureDb();
  const result = await getPool().query<{ count: string }>('SELECT COUNT(*) AS count FROM links WHERE user_id = $1', [
    ownerId,
  ]);
  return Number(result.rows[0]?.count ?? '0');
}

export async function findOwnerLinkByOriginalUrl(
  ownerId: string,
  originalUrl: string,
): Promise<LinkRecord | null> {
  await ensureDb();
  const result = await getPool().query<LinkDbRow>(
    'SELECT id, code, original_url, clicks, status, created_at, user_id FROM links WHERE user_id = $1 AND original_url = $2 LIMIT 1',
    [ownerId, originalUrl],
  );
  return result.rows[0] ? toLinkRecord(result.rows[0]) : null;
}

export async function findLinkByCode(code: string): Promise<LinkRecord | null> {
  await ensureDb();
  const result = await getPool().query<LinkDbRow>(
    'SELECT id, code, original_url, clicks, status, created_at, user_id FROM links WHERE code = $1 LIMIT 1',
    [code],
  );
  return result.rows[0] ? toLinkRecord(result.rows[0]) : null;
}

export async function insertLink(link: LinkRecord): Promise<void> {
  await ensureDb();
  await getPool().query(
    'INSERT INTO links (id, code, original_url, clicks, status, created_at, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [link.id, link.code, link.originalUrl, link.clicks, link.status, link.createdAt, link.userId],
  );
}

export async function updateLinkByOwner(
  id: string,
  ownerId: string,
  payload: { originalUrl?: string; status?: 'Active' | 'Inactive' },
): Promise<LinkRecord | null> {
  await ensureDb();

  const existingResult = await getPool().query<LinkDbRow>(
    'SELECT id, code, original_url, clicks, status, created_at, user_id FROM links WHERE id = $1 AND user_id = $2 LIMIT 1',
    [id, ownerId],
  );

  const existing = existingResult.rows[0];
  if (!existing) {
    return null;
  }

  const nextOriginalUrl = payload.originalUrl ?? existing.original_url;
  const nextStatus = payload.status ?? existing.status;

  const updatedResult = await getPool().query<LinkDbRow>(
    'UPDATE links SET original_url = $1, status = $2 WHERE id = $3 AND user_id = $4 RETURNING id, code, original_url, clicks, status, created_at, user_id',
    [nextOriginalUrl, nextStatus, id, ownerId],
  );

  return updatedResult.rows[0] ? toLinkRecord(updatedResult.rows[0]) : null;
}

export async function deleteLinkByOwner(id: string, ownerId: string): Promise<boolean> {
  await ensureDb();
  const result = await getPool().query('DELETE FROM links WHERE id = $1 AND user_id = $2', [id, ownerId]);
  return (result.rowCount ?? 0) > 0;
}

export async function incrementClicksAndResolve(code: string): Promise<string | null> {
  await ensureDb();
  const result = await getPool().query<{ original_url: string }>(
    "UPDATE links SET clicks = clicks + 1 WHERE code = $1 AND status = 'Active' RETURNING original_url",
    [code],
  );
  return result.rows[0]?.original_url ?? null;
}

export async function transferGuestLinksToUser(guestId: string, userId: string): Promise<void> {
  await ensureDb();

  await getPool().query(
    `
      UPDATE links AS guest_links
      SET user_id = $2
      WHERE guest_links.user_id = $1
      AND NOT EXISTS (
        SELECT 1
        FROM links AS user_links
        WHERE user_links.user_id = $2
          AND user_links.original_url = guest_links.original_url
      )
    `,
    [guestId, userId],
  );

  await getPool().query('DELETE FROM links WHERE user_id = $1', [guestId]);
}
