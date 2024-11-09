import { Hero } from '../../hero';
import { ModuleInitLog, logger } from '../../../winston';
import { Namespace } from 'socket.io';
import { RedisService } from '../../../services/redis.service';
import { Ana } from './ana.hero';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Skill } from '../../skill';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';

export class SleepDart extends Skill {
  constructor(
    public name: string,
    public whose: Player['id'],
    public matchId: Match['id'],
    public category: 'secondary',
    public type1: 'lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public cooltime: number,
    public duration: number,
    public power: number,
    public point: number
  ) {
    super(name, whose, matchId, category, type1, type2, isActive);
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
      await updateMatchStatus(io, redisService, player);

      setTimeout(async () => {
        this.isActive = true;
        await updateMatchStatus(io, redisService, player);
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
    await updateMatchStatus(io, redisService, player);

    setTimeout(async () => {
      this.isAsleep = false;
      await updateMatchStatus(io, redisService, player);
      console.log(`${this.name} woke up.`);
    }, duration);
  }
};
