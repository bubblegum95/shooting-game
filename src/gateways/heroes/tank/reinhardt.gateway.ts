import { Namespace } from 'socket.io';
import { RedisService } from '../../../services/redis.service';
import { logger, ModuleInitLog } from '../../../winston';

export class ReinhardtGateway {
  constructor(public io: Namespace, public redisService: RedisService) {
    this.init();
    logger.info(ModuleInitLog, { filename: 'ReinhardtGateway' });
  }

  init() {
    this.io.on('connection', (socket) => {
      socket.on('reinhardt:get', (reinhardt) => {
        console.log('reinhardt', reinhardt);
      });
    });
  }
}
