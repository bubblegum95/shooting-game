import { Hero } from '../../hero';
import { ModuleInitLog, logger } from '../../../../winston';
import { Namespace } from 'socket.io';
import { RedisService } from '../../../redis.service';
import { Ana } from './ana';
import { Skill } from '../../skill';

export class SleepDart extends Skill {
  constructor(
    public name: string,
    public isActive: boolean,
    public cooltime: number,
    public duration: number
  ) {
    super(name, isActive, cooltime, duration);
    logger.info(ModuleInitLog, { filename: 'SleepDart' });
  }

  async useTo(
    io: Namespace,
    redisService: RedisService,
    player: Ana,
    target?: Hero
  ) {
    if (this.isActive) {
      this.isActive = false;
      await redisService.setAllPlayerStatuses(player.playerId!, player);
      const result = await redisService.getMatchStatus(player.matchId);
      io.to(player.matchId).emit('match:status', result);

      setTimeout(async () => {
        this.isActive = true;
        await redisService.setAllPlayerStatuses(player.playerId!, player);
        const timeoutResult = await redisService.getMatchStatus(player.matchId);
        io.to(player.matchId).emit('match:status', timeoutResult);
      }, this.cooltime);

      if (target) {
        console.log(`${target.name} is hit by Sleep Dart and falls asleep.`);

        await target.sleep(io, redisService, player.matchId, this.duration);
        const result = await redisService.getMatchStatus(player.matchId);
        io.to(player.matchId).emit('match:status', result);
      }
    }
  }
}

Hero.prototype.sleep = async function (
  io: Namespace,
  redisService: RedisService,
  duration: number
) {
  this.isAsleep = true;
  console.log(`${this.name} is now asleep.`);
  await redisService.setAllPlayerStatuses(this.playerId, this);
  const result = await redisService.getMatchStatus(this.matchId);
  io.to(this.matchId).emit('match:status', result);

  setTimeout(async () => {
    this.isAsleep = false;
    await redisService.setAllPlayerStatuses(this.playerId!, this);
    const timeoutResult = await redisService.getMatchStatus(this.matchId);
    io.to(this.matchId).emit('match:status', timeoutResult);

    console.log(`${this.name} woke up.`);
  }, duration);
};
