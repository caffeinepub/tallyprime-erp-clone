const Redis = require('ioredis');

let client = null;
let connected = false;

async function initRedis() {
  const config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    retryStrategy: (times) => {
      if (times > 3) return null; // Stop retrying after 3 attempts
      return Math.min(times * 200, 1000);
    },
    lazyConnect: true
  };
  if (process.env.REDIS_PASSWORD) config.password = process.env.REDIS_PASSWORD;

  client = new Redis(config);
  await client.connect();
  connected = true;
  return client;
}

function getRedisClient() {
  return client;
}

const TTL = parseInt(process.env.REDIS_TTL) || 3600;

async function cacheGet(key) {
  if (!connected || !client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

async function cacheSet(key, value, ttl = TTL) {
  if (!connected || !client) return;
  try {
    await client.setex(key, ttl, JSON.stringify(value));
  } catch {}
}

async function cacheDel(pattern) {
  if (!connected || !client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(...keys);
  } catch {}
}

module.exports = { initRedis, getRedisClient, cacheGet, cacheSet, cacheDel };
