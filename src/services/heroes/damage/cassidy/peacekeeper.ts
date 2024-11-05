import { Namespace } from 'socket.io';
import { Cassidy } from './cassidy';
import { Hero } from '../../hero';
import { RedisService } from '../../../redis.service';
import { resetMatchStatus } from '../../renewMatchStatus';
import { ModuleInitLog, logger } from '../../../../winston';
import { LethalSkill } from '../../../skill/lethal.skill';

export class Peacekeeper extends LethalSkill {
  constructor(
    public name: string,
    public isActive: boolean,
    public cooltime: number,
    public bullets: number,
    public maxBullets: number,
    public power: number,
    public point: number,
    public chargingTime: number,
    public rampage: boolean,
    public casting: boolean,
    public castingDuration: number
  ) {
    super(name, isActive, cooltime, power, point);
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
    target: Hero
  ) {
    target.takeDamage(io, redisService, this.power);
    await resetMatchStatus(io, redisService, target);
    player.ultimate += this.point;
    await resetMatchStatus(io, redisService, player);
  }

  async useRampage(
    // 난사
    io: Namespace,
    redisService: RedisService,
    player: Cassidy
  ) {
    if (this.rampage) {
      this.rampage = false;
      this.casting = true;
      for (let i = 0; i < this.bullets; i++) {
        this.bullets -= 1;
        await this.resetMatchStatus(io, redisService, player);
        setTimeout(() => {}, this.castingDuration);
      }
      this.casting = false;
    }
  }
}
