import { Namespace } from 'socket.io';
import { Cassidy } from './cassidy';
import { Hero } from '../../hero';
import { RedisService } from '../../../redis.service';
import { resetMatchStatus } from '../../renewMatchStatus';
import { ModuleInitLog, logger } from '../../../../winston';
import { Skill } from '../../../skill/skill';

export class Peacekeeper extends Skill {
  constructor(
    public name: string,
    public category: 'primary',
    public type: 'lethal',
    public isDeployable: false,
    public isActive: boolean,
    public cooltime: number,
    public bullets: number,
    public maxBullets: number,
    public power: number,
    public point: number,
    public chargingTime: number
  ) {
    super(name, category, type, isDeployable, isActive);
    logger.info(ModuleInitLog, { filename: 'Peachkeeper' });
  }

  async powerUp(
    io: Namespace,
    redisService: RedisService,
    player: Hero,
    increase: number,
    duration: number
  ) {
    super.powerUp(io, redisService, player, increase, duration);
  }

  async chargeBullets(
    io: Namespace,
    redisService: RedisService,
    player: Cassidy
  ) {
    super.chargeBullets(io, redisService, player);
  }

  async shot(io: Namespace, redisService: RedisService, player: Cassidy) {
    if (this.isActive && this.bullets > 0) {
      this.bullets -= 1;
      this.isActive = false;
      await resetMatchStatus(io, redisService, player);

      if (this.bullets <= 0) {
        this.chargeBullets(io, redisService, player);
      }

      setTimeout(async () => {
        this.isActive = true;
        await resetMatchStatus(io, redisService, player);
      }, this.cooltime);
    } else if (this.bullets <= 0) {
      this.chargeBullets(io, redisService, player);
    }
  }

  async heat(
    io: Namespace,
    redisService: RedisService,
    player: Cassidy,
    target: Hero,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    target.takeDamage(io, redisService, this.power, callback);
    await resetMatchStatus(io, redisService, target);
    player.ultimate += this.point;
    await resetMatchStatus(io, redisService, player);
  }
}
