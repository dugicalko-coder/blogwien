// Server-only Datenzugriff fuer BlogWien auf Vercel.
// Stellt eine D1-kompatible Schnittstelle (prepare/bind/first/all/run/batch) ueber
// Supabase-Postgres bereit, damit der restliche Code unveraendert bleibt.
// Bilder liegen in der Tabelle `images` (bytea) und werden ueber /bild/<key> ausgeliefert.
import postgres from "postgres";

type Row = Record<string, unknown>;

let sqlClient: ReturnType<typeof postgres> | null = null;

function client(): ReturnType<typeof postgres> | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!sqlClient) {
    sqlClient = postgres(url, {
      prepare: false, // Supabase Transaction-Pooler (Port 6543)
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: "require",
      types: {
        // COUNT/SUM liefern bigint/numeric: als Zahl zurueckgeben wie in SQLite
        bigint: { to: 20, from: [20, 1700], serialize: (x: unknown) => String(x), parse: (x: string) => Number(x) },
      },
    });
  }
  return sqlClient;
}

// SQLite-Dialekt der bestehenden Abfragen nach Postgres uebersetzen.
function translate(sql: string): string {
  let s = sql;
  s = s.replace(/datetime\('now'\)/g, "to_char(now() at time zone 'utc', 'YYYY-MM-DD HH24:MI:SS')");
  s = s.replace(/SUM\((\w+)\s*=\s*'([^']*)'\)/g, "SUM(CASE WHEN $1 = '$2' THEN 1 ELSE 0 END)");
  if (/INSERT\s+OR\s+IGNORE\s+INTO/i.test(s)) {
    s = s.replace(/INSERT\s+OR\s+IGNORE\s+INTO/i, "INSERT INTO") + " ON CONFLICT DO NOTHING";
  }
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+settings/i.test(s)) {
    s = s.replace(/INSERT\s+OR\s+REPLACE\s+INTO/i, "INSERT INTO") + " ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value";
  }
  if (/^\s*INSERT\s+INTO\s+posts\b/i.test(s) && !/RETURNING/i.test(s)) s += " RETURNING id";
  let i = 0;
  s = s.replace(/\?/g, () => `$${++i}`);
  return s;
}

export type D1Result<T = Row> = { results: T[]; success: boolean; meta: { last_row_id: number; changes: number } };

export class Statement {
  constructor(
    private readonly sql: string,
    private readonly params: unknown[] = [],
  ) {}

  bind(...values: unknown[]): Statement {
    return new Statement(this.sql, values.map((v) => (v === undefined ? null : v)));
  }

  async exec(runner?: ReturnType<typeof postgres>): Promise<Row[]> {
    const c = runner ?? client();
    if (!c) throw new Error("DATABASE_URL fehlt");
    const rows = await c.unsafe(translate(this.sql), this.params as never[]);
    return rows as unknown as Row[];
  }

  async first<T = Row>(): Promise<T | null> {
    const rows = await this.exec();
    return (rows[0] as T) ?? null;
  }

  async all<T = Row>(): Promise<D1Result<T>> {
    const rows = await this.exec();
    return { results: rows as T[], success: true, meta: { last_row_id: 0, changes: rows.length } };
  }

  async run(): Promise<D1Result> {
    const rows = await this.exec();
    const id = rows[0] && typeof rows[0].id === "number" ? (rows[0].id as number) : 0;
    return { results: [], success: true, meta: { last_row_id: id, changes: rows.length } };
  }
}

export class Database {
  prepare(sql: string): Statement {
    return new Statement(sql);
  }

  async batch(stmts: Statement[]): Promise<D1Result[]> {
    const c = client();
    if (!c) throw new Error("DATABASE_URL fehlt");
    const out: D1Result[] = [];
    await c.begin(async (tx) => {
      for (const st of stmts) {
        await st.exec(tx as unknown as ReturnType<typeof postgres>);
        out.push({ results: [], success: true, meta: { last_row_id: 0, changes: 0 } });
      }
    });
    return out;
  }
}

export type StoredObject = { body: Uint8Array; httpMetadata: { contentType: string }; httpEtag: string };

export class ImageStore {
  async put(key: string, data: ArrayBuffer | Uint8Array, opts?: { httpMetadata?: { contentType?: string } }): Promise<void> {
    const c = client();
    if (!c) throw new Error("DATABASE_URL fehlt");
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    await c`INSERT INTO images (key, content_type, data) VALUES (${key}, ${opts?.httpMetadata?.contentType ?? "image/jpeg"}, ${Buffer.from(bytes)})
            ON CONFLICT (key) DO UPDATE SET content_type = EXCLUDED.content_type, data = EXCLUDED.data`;
  }

  async get(key: string): Promise<StoredObject | null> {
    const c = client();
    if (!c) return null;
    const rows = await c`SELECT content_type, data FROM images WHERE key = ${key}`;
    const r = rows[0] as { content_type: string; data: Buffer } | undefined;
    if (!r) return null;
    return { body: new Uint8Array(r.data), httpMetadata: { contentType: r.content_type }, httpEtag: `"${key}"` };
  }
}

type AppEnv = {
  HF_ENV?: string;
  DB?: Database;
  STORAGE?: ImageStore;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
};

const db = new Database();
const store = new ImageStore();

export function bindings(): AppEnv {
  const hasDb = Boolean(process.env.DATABASE_URL);
  return {
    DB: hasDb ? db : undefined,
    STORAGE: hasDb ? store : undefined,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  };
}
