import { Namespace } from 'socket.io';
import { RedisService } from '../../../services/redis.service';
import { ModuleInitLog, logger } from '../../../winston';
import { Hero } from '../../../heroes/hero';
import { Ana } from '../../../heroes/support/ana/ana.hero';

export class AnaGateway {
  constructor(private io: Namespace, private redisService: RedisService) {
    this.init();
    logger.info(ModuleInitLog, { filename: 'AnaGateway' });
  }

  init() {
    this.io.on('connection', (socket) => {
      socket.on('ana:get', ({ ana }) => {
        this.getHero(ana);
      });

      socket.on('ana:bioticRifle:use', ({ ana }) => {
        this.useBioticRifle(ana);
      });

      socket.on('ana:bioticRifle:to', ({ ana, target }) => {
        this.useBioticRifleTo(ana, target);
      });

      socket.on('ana:scope:use', ({ ana }) => {
        this.useScope(ana);
      });

      socket.on('ana:scope:noUse', ({ ana }) => {
        this.noUseScope(ana);
      });

      socket.on('ana:sleepDart:use', ({ ana }) => {
        this.useSleepDart(ana);
      });

      socket.on('ana:sleepDart:to', ({ ana, target }) => {
        this.useSleepDartTo(ana, target);
      });

      socket.on('ana:bioticGrenade:use', ({ ana }) => {
        this.useBioticGrenade(ana);
      });

      socket.on('ana:bioticGrenade:to', ({ ana, target }) => {
        this.useBioticGrenadeTo(ana, target);
      });

      socket.on('ana:nanoBoost:useTo', ({ ana, target }) => {
        // 나노 강화제 타겟 반드시 필요
        this.useNanoBoost(ana, target);
      });

      socket.on('ana:bioticRifle:chargeBullets', ({ ana }) => {
        this.chargeBullets(ana);
      });
    });
  }

  // 함수에 필요한 정보 -> 아나 객체, 소켓, 타켓
  async getHero(hero: Hero) {
    console.log(hero);
  }

  async useBioticRifle(ana: Ana) {
    await ana.shot(this.io, this.redisService);
  }

  async useBioticRifleTo(ana: Ana, target: Hero) {
    await ana.heat(this.io, this.redisService, target);
  }

  async useScope(ana: Ana) {
    await ana.useScope(this.io, this.redisService);
  }

  async noUseScope(ana: Ana) {
    await ana.noUseScope(this.io, this.redisService);
  }

  async useSleepDart(ana: Ana) {
    await ana.usesSleepDart(this.io, this.redisService);
  }

  async useSleepDartTo(ana: Ana, target: Hero) {
    await ana.usesSleepDartTo(this.io, this.redisService, target);
  }

  async useBioticGrenade(ana: Ana) {
    await ana.usesBioticGrenade(this.io, this.redisService);
  }

  async useBioticGrenadeTo(ana: Ana, target: Hero) {
    await ana.usesBioticGrenadeTo(this.io, this.redisService, target);
  }

  async useNanoBoost(ana: Ana, target: Hero) {
    await ana.usesNanoBoost(this.io, this.redisService, target);
  }

  async chargeBullets(ana: Ana) {
    await ana.chargeBullets(this.io, this.redisService);
  }
}
