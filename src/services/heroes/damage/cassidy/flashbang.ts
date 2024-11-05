import { Namespace } from 'socket.io';
import { ModuleInitLog, logger } from '../../../../winston';
import { RedisService } from '../../../redis.service';
import { Cassidy } from './cassidy';
import { Hero } from '../../hero';
import { resetMatchStatus } from '../../renewMatchStatus';
import { LethalSkill } from '../../../skill/lethal.skill';

export class Flashbang extends LethalSkill {
  constructor(
    public name: string,
    public isActive: boolean,
    public duration: number,
    public cooltime: number,
    public power: number,
    public point: number
  ) {
    super(name, isActive, cooltime, power, point);
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

  async use(io: Namespace, redisService: RedisService, player: Cassidy) {
    if (this.isActive) {
      this.isActive = false;
      await resetMatchStatus(io, redisService, player);

      setTimeout(async () => {
        this.isActive = true;
        await resetMatchStatus(io, redisService, player);
      }, this.cooltime);
    }
  }

  async to(
    io: Namespace,
    redisService: RedisService,
    player: Cassidy,
    target: Hero
  ) {
    target.takeDamage(io, redisService, this.power);
    target.shocked(io, redisService, this.duration);
    await resetMatchStatus(io, redisService, player);
  }
}

Hero.prototype.shocked = async function (
  io: Namespace,
  redisService: RedisService,
  duration: number
) {
  if (this.isAlive) {
    this.isShocked = true;
    this.isNotAbleToUseSkillsDuring(duration);
    await resetMatchStatus(io, redisService, this);

    setTimeout(async () => {
      this.isShocked = false;
      await resetMatchStatus(io, redisService, this);
    }, duration);
  }
};
