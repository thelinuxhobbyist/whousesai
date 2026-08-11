/** Minimal Cloudflare D1 typings used by the app DB layer. */
interface D1Meta {
  last_row_id?: number;
  changes?: number;
}

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: D1Meta;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<{ meta: D1Meta; success: boolean }>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<unknown>;
}

interface Env {
  whousesai_db: D1Database;
}
