import Redis from "ioredis";
import { logger } from "../utils/logger";

class CacheManager {
  private client: Redis | null = null;
  private memoryCache = new Map<string, { value: unknown; expiresAt: number }>();
  private isRedisConnected = false;

  constructor() {
    this.init();
  }

  private init() {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;
    const redisHost = process.env.REDIS_HOST;

    if (redisUrl || redisHost) {
      try {
        const client = redisUrl
          ? new Redis(redisUrl, {
              connectTimeout: 4000,
              maxRetriesPerRequest: 2,
              enableAutoPipelining: true,
              retryStrategy(times) {
                if (times > 3) return null; // stop retrying and fall back to memory
                return Math.min(times * 100, 1000);
              },
            })
          : new Redis({
              host: redisHost,
              port: parseInt(process.env.REDIS_PORT || "6379", 10),
              password: process.env.REDIS_PASSWORD || undefined,
              connectTimeout: 4000,
              maxRetriesPerRequest: 2,
              enableAutoPipelining: true,
              retryStrategy(times) {
                if (times > 3) return null;
                return Math.min(times * 100, 1000);
              },
            });

        client.on("connect", () => {
          this.isRedisConnected = true;
          logger.info("[Cache] Redis cache connected successfully");
        });

        client.on("error", (err) => {
          if (this.isRedisConnected) {
            logger.warn("[Cache] Redis error, falling back to in-memory cache:", err.message);
          }
          this.isRedisConnected = false;
        });

        this.client = client;
      } catch (err) {
        logger.warn("[Cache] Could not initialize Redis client, using in-memory fallback:", err);
      }
    } else {
      logger.info("[Cache] No Redis credentials detected. Initialized high-performance in-memory cache layer.");
    }
  }

  /**
   * Get cached value or execute fallback function with jittered TTL.
   */
  async getOrSet<T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T> {
    // 1. Try Redis if connected
    if (this.isRedisConnected && this.client) {
      try {
        const cached = await this.client.get(key);
        if (cached) {
          return JSON.parse(cached) as T;
        }
      } catch {
        // Continue to fetchFn on cache read error
      }
    } else {
      // 2. Try In-Memory cache
      const mem = this.memoryCache.get(key);
      if (mem && mem.expiresAt > Date.now()) {
        return mem.value as T;
      }
    }

    // 3. Fetch fresh data
    const freshData = await fetchFn();

    if (freshData !== undefined && freshData !== null) {
      // Add jitter (+/- 10%) to prevent cache stampede / thundering herd
      const jitter = Math.floor(Math.random() * (ttlSeconds * 0.1));
      const finalTtl = ttlSeconds + jitter;

      if (this.isRedisConnected && this.client) {
        try {
          await this.client.setex(key, finalTtl, JSON.stringify(freshData));
        } catch {
          // Non-blocking write error
        }
      } else {
        this.memoryCache.set(key, {
          value: freshData,
          expiresAt: Date.now() + finalTtl * 1000,
        });

        // Periodic memory cleanup (keep cache size < 5000 items)
        if (this.memoryCache.size > 5000) {
          const now = Date.now();
          for (const [k, v] of this.memoryCache.entries()) {
            if (v.expiresAt <= now) this.memoryCache.delete(k);
          }
        }
      }
    }

    return freshData;
  }

  /**
   * Invalidate a specific cache key.
   */
  async invalidate(key: string): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        await this.client.del(key);
      } catch {
        // Non-blocking
      }
    }
    this.memoryCache.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix.
   */
  async invalidatePrefix(prefix: string): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        const keys = await this.client.keys(`${prefix}*`);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch {
        // Fallback
      }
    }

    for (const k of this.memoryCache.keys()) {
      if (k.startsWith(prefix)) {
        this.memoryCache.delete(k);
      }
    }
  }
}

export const cacheService = new CacheManager();
