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
  let value;

  try {
    value = await redis.get(key);
  } catch (error) {
    console.error(`Cache read failed for ${key}: ${error.message}`);
    return null;
  }

  return parseCacheValue(value);
};

const setCache = async (key, value, ttlSeconds) => {
  const serializedValue = serializeCacheValue(value);

  if (serializedValue === undefined) {
    return false;
  }

  if (ttlSeconds && Number(ttlSeconds) > 0) {
    try {
      await redis.set(key, serializedValue, 'EX', Number(ttlSeconds));
    } catch (error) {
      console.error(`Cache write failed for ${key}: ${error.message}`);
      return false;
    }

    return true;
  }

  try {
    await redis.set(key, serializedValue);
  } catch (error) {
    console.error(`Cache write failed for ${key}: ${error.message}`);
    return false;
  }

  return true;
};

const deleteCache = async (key) => {
  try {
    return await redis.del(key);
  } catch (error) {
    console.error(`Cache delete failed for ${key}: ${error.message}`);
    return 0;
  }
};

const deleteByPattern = async (pattern) => {
  let cursor = '0';
  let deletedCount = 0;

  do {
    let result;

    try {
      result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    } catch (error) {
      console.error(`Cache pattern scan failed for ${pattern}: ${error.message}`);
      return deletedCount;
    }

    const [nextCursor, keys] = result;
    cursor = nextCursor;

    if (keys.length) {
      try {
        deletedCount += await redis.del(...keys);
      } catch (error) {
        console.error(`Cache pattern delete failed for ${pattern}: ${error.message}`);
      }
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
