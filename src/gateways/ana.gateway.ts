import { Namespace } from 'socket.io';
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
      socket.on('ana:attackAndHeal', ({ ana, target }) => {
        this.attackHeal(this.io, ana, target);
      });

      socket.on('ana:useScope', ({ ana }) => {
        this.useScope(this.io, ana);
      });

      socket.on('ana:noUseScope', ({ ana }) => {
        this.noUseScope(this.io, ana);
      });

      socket.on('ana:useSleepDart', ({ ana, target }) => {
        this.useSleepDart(this.io, ana, target);
      });

      socket.on('ana:useBioticGrenade', ({ ana, target }) => {
        this.useBioticGrenade(this.io, ana, target);
      });

      socket.on('ana:useNanoBoost', ({ ana, target }) => {
        this.useNanoBoost(this.io, ana, target);
      });

      socket.on('ana:chargeBullets', ({ ana }) => {
        this.chargeBullets(this.io, ana);
      });
    });
  }

  // 함수에 필요한 정보 -> 아나 객체, 소켓, 타켓
  async attackHeal(io: Namespace, ana: Ana, target: Hero) {
    await ana.attackAndHeal(io, this.redisService, target);
  }

  async useScope(io: Namespace, ana: Ana) {
    await ana.useScope(io, this.redisService);
  }

  async noUseScope(io: Namespace, ana: Ana) {
    await ana.noUseScope(io, this.redisService);
  }

  async useSleepDart(io: Namespace, ana: Ana, target: Hero) {
    await ana.usesSleepDart(io, this.redisService, target);
  }

  async useBioticGrenade(io: Namespace, ana: Ana, target: Hero) {
    await ana.usesBioticGrenade(io, this.redisService, target);
  }

  async useNanoBoost(io: Namespace, ana: Ana, target: Hero) {
    await ana.usesNanoBoost(io, this.redisService, target);
  }

  async chargeBullets(io: Namespace, ana: Ana) {
    await ana.chargeBullets(io, this.redisService);
  }
}
