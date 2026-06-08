const { redis } = require('../config/redis');

const cacheKeys = {
  articlesList: 'articles:list',
  articleSlug: (slug) => `articles:slug:${slug}`,
  articlesSimilar: (slug) => `articles:similar:${slug}`,
  adminAnalytics: 'admin:analytics',
  doctorsList: 'doctors:list'
};

const serializeCacheValue = (value) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error(`Cache serialization failed: ${error.message}`);
    return undefined;
  }
};

const parseCacheValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`Cache parse failed: ${error.message}`);
    return null;
  }
};

const getCache = async (key) => {
  const value = await redis.get(key);

  return parseCacheValue(value);
};

const setCache = async (key, value, ttlSeconds) => {
  const serializedValue = serializeCacheValue(value);

  if (serializedValue === undefined) {
    return false;
  }

  if (ttlSeconds && Number(ttlSeconds) > 0) {
    await redis.set(key, serializedValue, 'EX', Number(ttlSeconds));
    return true;
  }

  await redis.set(key, serializedValue);
  return true;
};

const deleteCache = async (key) => {
  return redis.del(key);
};

const deleteByPattern = async (pattern) => {
  let cursor = '0';
  let deletedCount = 0;

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = nextCursor;

    if (keys.length) {
      deletedCount += await redis.del(...keys);
    }
  } while (cursor !== '0');

  return deletedCount;
};

module.exports = {
  cacheKeys,
  getCache,
  setCache,
  deleteCache,
  deleteByPattern
};
