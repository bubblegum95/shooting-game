import { Hero } from '../../hero';
import { ModuleInitLog, logger } from '../../../../winston';
import { Namespace } from 'socket.io';
import { RedisService } from '../../../redis.service';
import { Ana } from './ana';
import { resetMatchStatus } from '../../renewMatchStatus';
import { Skill } from '../../../skill/skill';

export class SleepDart extends Skill {
  constructor(
    public name: string,
    public category: 'secondary',
    public type: 'lethal',
    public isDeployable: false,
    public isActive: boolean,
    public cooltime: number,
    public duration: number,
    public power: number,
    public point: number
  ) {
    super(name, category, type, isDeployable, isActive);
    logger.info(ModuleInitLog, { filename: 'SleepDart' });
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

  async use(io: Namespace, redisService: RedisService, player: Ana) {
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
    player: Ana,
    target: Hero,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    console.log(`${target.name} is hit by Sleep Dart and falls asleep.`);

    await target.sleep(io, redisService, player, this.duration);
    await target.takeDamage(io, redisService, this.power, callback);
    player.ultimate += this.point;
  }
}

Hero.prototype.sleep = async function (
  io: Namespace,
  redisService: RedisService,
  player: Hero,
  duration: number
) {
  if (this.isAlive) {
    this.isAsleep = true;
    console.log(`${this.name} is now asleep.`);
    await resetMatchStatus(io, redisService, player);

    setTimeout(async () => {
      this.isAsleep = false;
      await resetMatchStatus(io, redisService, player);
      console.log(`${this.name} woke up.`);
    }, duration);
  }
};
