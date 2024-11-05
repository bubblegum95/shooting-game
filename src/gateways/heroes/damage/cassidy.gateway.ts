import { Namespace } from 'socket.io';
import { RedisService } from '../../../services/redis.service';

export class CassidyGateway {
  constructor(
    private readonly io: Namespace,
    private readonly redisService: RedisService
  ) {}
}
