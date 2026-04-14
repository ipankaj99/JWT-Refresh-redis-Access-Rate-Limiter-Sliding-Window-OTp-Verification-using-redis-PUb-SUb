import redis from './redis.js';

const WINDOW_SIZE = 60; // seconds
const MAX_REQ = 4;

const rateLimiter = async (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  const windowStart = now - WINDOW_SIZE * 1000;

  // 1. remove old requests
  await redis.zremrangebyscore(ip, 0, windowStart);

  // 2. count requests in window
  const count = await redis.zcard(ip);

  if (count >= MAX_REQ) {
    return res.status(429).json({ message: "Too many requests" });
  }

  // 3. add current request
  await redis.zadd(ip, now, now.toString());

  // 4. optional cleanup
  await redis.expire(ip, WINDOW_SIZE);

  next();
};

export default rateLimiter;