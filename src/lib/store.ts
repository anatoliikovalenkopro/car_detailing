import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

// Tiny key-value store. Uses Upstash Redis in production (works on Vercel),
// or a local JSON file in development when no Redis credentials are set.

type Json = unknown;

interface KV {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: Json): Promise<void>;
  sadd(key: string, member: string): Promise<void>;
  smembers(key: string): Promise<string[]>;
}

class RedisKV implements KV {
  private r = Redis.fromEnv();
  async get<T>(key: string) {
    return (await this.r.get<T>(key)) ?? null;
  }
  async set(key: string, value: Json) {
    await this.r.set(key, value);
  }
  async sadd(key: string, member: string) {
    await this.r.sadd(key, member);
  }
  async smembers(key: string) {
    return this.r.smembers(key);
  }
}

class FileKV implements KV {
  private file = path.join(process.cwd(), ".data", "db.json");
  private queue: Promise<unknown> = Promise.resolve();

  private async read(): Promise<Record<string, Json>> {
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch {
      return {};
    }
  }
  private async write(db: Record<string, Json>) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(db, null, 2));
  }
  // Serialize writes so concurrent requests don't clobber each other.
  private mutate(fn: (db: Record<string, Json>) => void) {
    const next = this.queue.then(async () => {
      const db = await this.read();
      fn(db);
      await this.write(db);
    });
    this.queue = next.catch(() => {});
    return next;
  }
  async get<T>(key: string) {
    await this.queue;
    return ((await this.read())[key] as T) ?? null;
  }
  async set(key: string, value: Json) {
    await this.mutate((db) => {
      db[key] = value;
    });
  }
  async sadd(key: string, member: string) {
    await this.mutate((db) => {
      const set = new Set((db[key] as string[]) ?? []);
      set.add(member);
      db[key] = [...set];
    });
  }
  async smembers(key: string) {
    await this.queue;
    return ((await this.read())[key] as string[]) ?? [];
  }
}

export const kv: KV =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new RedisKV()
    : new FileKV();
