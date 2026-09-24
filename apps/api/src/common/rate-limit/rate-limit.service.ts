import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class RateLimitService {
  constructor(private readonly redis: RedisService) {}

  async consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean> {
    const count = await this.redis.client.incr(key);
    if (count === 1) {
      await this.redis.client.expire(key, windowSeconds);
    }
    return count <= limit;
  }
}
