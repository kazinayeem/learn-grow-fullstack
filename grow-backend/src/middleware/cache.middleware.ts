import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../utils/cache.js';

/**
 * Cache middleware for GET requests
 * @param ttl - Time to live in seconds
 */
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `cache:${req.originalUrl}`;

    try {
      // Try to get cached response
      const cachedResponse = await CacheService.get(cacheKey);
      
      if (cachedResponse) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.json(cachedResponse);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function(data: any) {
        // Cache the response
        CacheService.set(cacheKey, data, ttl).catch(console.error);
        // Send response
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};
