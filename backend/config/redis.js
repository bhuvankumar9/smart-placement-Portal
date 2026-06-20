import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 5) {
      return null;
    }

    return Math.min(times * 200, 2000);
  },
});

redis.on("error", (error) => {
  console.error("Redis error:", error.message);
});

export { redis };
