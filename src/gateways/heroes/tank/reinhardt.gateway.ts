import { Namespace } from 'socket.io';
import { RedisService } from '../../../services/redis.service';
import { logger, ModuleInitLog } from '../../../winston';
import { Reinhardt } from '../../../heroes/tank/reinhardt/reinhardt.hero';
import { Skill } from '../../../heroes/skill';
import { Hero } from '../../../heroes/hero';

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

      socket.on('reinhardt:rocketHammer:use', ({ reinhardt }) => {});
    });
  }

  async useRocketHammer(reinhardt: Reinhardt) {
    await reinhardt.useRocketHammer(this.io, this.redisService);
  }

  async useRocketHammerTo(reinhardt: Reinhardt, target: Hero | Skill) {
    await reinhardt.useRocketHammerTo(this.io, this.redisService, target);
  }

  async useFireStrike(reinhardt: Reinhardt) {
    await reinhardt.useFireStrike(this.io, this.redisService);
  }

  async useFireStrikeTo(reinhardt: Reinhardt, target: Hero | Skill) {
    await reinhardt.useFireStrikeTo(this.io, this.redisService, target);
  }

  async useBarrierField(reinhardt: Reinhardt) {
    await reinhardt.useBarrierField(this.io, this.redisService);
  }

  async useCharge(reinhardt: Reinhardt) {
    await reinhardt.charge(this.io, this.redisService);
  }

  async useEarthshatter(reinhardt: Reinhardt) {
    await reinhardt.useEarthshatter(this.io, this.redisService);
  }

  async useEarthshatterTo(reinhardt: Reinhardt, target: Hero | Skill) {
    await reinhardt.useEarthshatterTo(this.io, this.redisService, target);
  }
}
