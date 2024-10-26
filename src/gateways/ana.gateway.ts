import { Namespace } from 'socket.io';
import { HeroName } from '../types/hero-name.type';
import { Ana } from '../services/heroes/support/ana/ana';
import { Hero } from '../services/heroes/hero';
import { ModuleInitLog, logger } from '../winston';
import { RedisService } from '../services/redis.service';

export class AnaGateWay {
  constructor(private io: Namespace, private redisService: RedisService) {
    this.socketInit();
    logger.info(ModuleInitLog, { filename: 'AnaGateway' });
  }

  socketInit() {
    this.io.on('connection', (socket) => {
      socket.on('ana:heal', ({ ana, target }) => {
        this.heal(this.io, ana, target);
      });
    });
  }

  // 함수에 필요한 정보 -> 아나 객체, 소켓, 타켓
  async heal(io: Namespace, ana: Ana, target: Hero) {
    if (ana.name === HeroName.Ana && ana.team === target.team) {
      const point = 10;
      await ana.healsAlly(io, this.redisService, target, point);
    }
  }

  async deal(io: Namespace, ana: Ana, target: Hero) {
    if (ana.name === HeroName.Ana && ana.team !== target.team) {
      await ana.attacksEnamy(io, this.redisService, target);
    }
  }

  async useSleepDart(io: Namespace, ana: Ana, target: Hero) {
    if (ana.name === HeroName.Ana && ana.team !== target.team) {
      await ana.usesSleepDart(io, this.redisService, target);
    }
  }

  async useBioticGrenade(io: Namespace, ana: Ana, target: Hero) {
    await ana.usesBioticGrenade(io, this.redisService, target);
  }

  async useNanoBoost(io: Namespace, ana: Ana, target: Hero) {
    await ana.usesNanoBoost(io, this.redisService, target);
  }
}
