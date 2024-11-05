import { Namespace } from 'socket.io';
import { RedisService } from '../../../services/redis.service';
import { ModuleInitLog, logger } from '../../../winston';
import { Hero } from '../../../services/heroes/hero';
import { Ana } from '../../../services/heroes/support/ana/ana';

export class AnaGateWay {
  constructor(private io: Namespace, private redisService: RedisService) {
    this.socketInit();
    logger.info(ModuleInitLog, { filename: 'AnaGateway' });
  }

  socketInit() {
    this.io.on('connection', (socket) => {
      socket.on('ana:get', ({ ana }) => {
        this.getHero(ana);
      });
      socket.on('ana:bioticRifle:use', ({ ana }) => {
        this.useBioticRifle(this.io, ana);
      });

      socket.on('ana:bioticRifle:heat', ({ ana, target }) => {
        this.useBioticRifleTo(this.io, ana, target);
      });

      socket.on('ana:scope:use', ({ ana }) => {
        this.useScope(this.io, ana);
      });

      socket.on('ana:scope:noUse', ({ ana }) => {
        this.noUseScope(this.io, ana);
      });

      socket.on('ana:sleepDart:use', ({ ana }) => {
        this.useSleepDart(this.io, ana);
      });

      socket.on('ana:sleepDart:heat', ({ ana, target }) => {
        this.useSleepDartTo(this.io, ana, target);
      });

      socket.on('ana:BioticGrenade:use', ({ ana }) => {
        this.useBioticGrenade(this.io, ana);
      });

      socket.on('ana:BioticGrenade:heat', ({ ana, target }) => {
        this.useBioticGrenadeTo(this.io, ana, target);
      });

      socket.on('ana:nanoBoost:useTo', ({ ana, target }) => {
        // 나노 강화제 타겟 반드시 필요
        this.useNanoBoost(this.io, ana, target);
      });

      socket.on('ana:bioticRifle:chargeBullets', ({ ana }) => {
        this.chargeBullets(this.io, ana);
      });
    });
  }

  // 함수에 필요한 정보 -> 아나 객체, 소켓, 타켓
  async getHero(hero: Hero) {
    console.log(hero);
  }

  async useBioticRifle(io: Namespace, ana: Ana) {
    await ana.shot(io, this.redisService);
  }

  async useBioticRifleTo(io: Namespace, ana: Ana, target: Hero) {
    await ana.heat(io, this.redisService, target);
  }

  async useScope(io: Namespace, ana: Ana) {
    await ana.useScope(io, this.redisService);
  }

  async noUseScope(io: Namespace, ana: Ana) {
    await ana.noUseScope(io, this.redisService);
  }

  async useSleepDart(io: Namespace, ana: Ana) {
    await ana.usesSleepDart(io, this.redisService);
  }

  async useSleepDartTo(io: Namespace, ana: Ana, target: Hero) {
    await ana.usesSleepDartTo(io, this.redisService, target);
  }

  async useBioticGrenade(io: Namespace, ana: Ana) {
    await ana.usesBioticGrenade(io, this.redisService);
  }

  async useBioticGrenadeTo(io: Namespace, ana: Ana, target: Hero) {
    await ana.usesBioticGrenadeTo(io, this.redisService, target);
  }

  async useNanoBoost(io: Namespace, ana: Ana, target: Hero) {
    await ana.usesNanoBoost(io, this.redisService, target);
  }

  async chargeBullets(io: Namespace, ana: Ana) {
    await ana.chargeBullets(io, this.redisService);
  }
}
