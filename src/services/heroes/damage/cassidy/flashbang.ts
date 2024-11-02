import { Namespace } from 'socket.io';
import { ModuleInitLog, logger } from '../../../../winston';
import { RedisService } from '../../../redis.service';
import { Cassidy } from './cassidy';
import { Hero } from '../../hero';
import { resetMatchStatus } from '../../renewMatchStatus';
import { LethalSkill } from '../../lethal-skill';

export class Flashbang extends LethalSkill {
  constructor(
    public name: string,
    public isActive: boolean,
    public duration: number,
    public cooltime: number,
    public power: number
  ) {
    super(name, isActive, duration);
    logger.info(ModuleInitLog, { filename: 'Flashbang' });
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

  async useFlashbang(
    io: Namespace,
    redisService: RedisService,
    player: Cassidy,
    target: Hero
  ) {
    if (this.isActive) {
      this.isActive = false;
      await resetMatchStatus(io, redisService, player);

      setTimeout(async () => {
        this.isActive = true;
        await resetMatchStatus(io, redisService, player);
      }, this.cooltime);

      if (target) {
        target.isShocked = true;
        target.speed = 0;
        await resetMatchStatus(io, redisService, player);
        target.shock(io, redisService, this.duration);
      }
    }
  }
}

Hero.prototype.shock = async function (
  io: Namespace,
  redisService: RedisService,
  duration: number
) {
  this.isShocked = true;
  const heroSpeed = this.speed;
  await resetMatchStatus(io, redisService, this);

  setTimeout(async () => {
    this.isShocked = false;
    this.speed = heroSpeed;
    await resetMatchStatus(io, redisService, this);
  }, duration);
};
