import { Namespace } from 'socket.io';
import { Cassidy } from './cassidy';
import { Hero } from '../../hero';
import { RedisService } from '../../../redis.service';
import { resetMatchStatus } from '../../renewMatchStatus';
import { ModuleInitLog, logger } from '../../../../winston';
import { LethalSkill } from '../../lethal-skill';

export class Peacekeeper extends LethalSkill {
  constructor(
    public name: string,
    public isActive: boolean,
    public cooltime: number,
    public bullets: number,
    public maxBullets: number,
    public power: number,
    public chargingTime: number
  ) {
    super(name, isActive, cooltime);
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

  async shot(
    io: Namespace,
    redisService: RedisService,
    player: Cassidy,
    target: Hero
  ) {
    this.bullets -= 1;
    this.isActive = false;
    await resetMatchStatus(io, redisService, player);

    setTimeout(async () => {
      this.isActive = true;
      await resetMatchStatus(io, redisService, player);
    }, this.cooltime);

    if (target) {
      target.health -= this.power;
      await resetMatchStatus(io, redisService, target);
    }
  }

  async rampage(
    io: Namespace,
    redisService: RedisService,
    player: Cassidy,
    target: Hero
  ) {
    for (let i = 0; i < this.bullets; i++) {
      this.bullets -= 1;
      await this.resetMatchStatus(io, redisService, player);

      if (target) {
        target.health -= this.power;
        await this.resetMatchStatus(io, redisService, target);
      }
    }
    await this.chargeBullets(io, redisService, player);
  }
}
