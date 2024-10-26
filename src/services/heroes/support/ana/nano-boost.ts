import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { Ana } from './ana';
import { RedisService } from '../../../redis.service';
import { Skill } from '../../skill';
import { ModuleInitLog, logger } from '../../../../winston';

export class NanoBoost extends Skill {
  constructor(
    public name: string,
    public isActive: boolean, // 활성화
    public duration: number, // 스킬 지속시간
    public increase: number // 공격력 증가량
  ) {
    super(name, isActive, duration, increase);
    logger.info(ModuleInitLog, { filename: 'NanoBoost' });
  }

  async useTo(
    io: Namespace,
    redisService: RedisService,
    player: Ana,
    target: Hero
  ) {
    if (this.isActive && target) {
      console.log(`the power of ${target.name} increases.`);
      this.isActive = false;
      target.power *= this.increase;
      await redisService.setAllPlayerStatuses(player.playerId!, player);
      await redisService.setAllPlayerStatuses(target.playerId!, target);
      const data = await redisService.getMatchStatus(player.matchId);
      io.to(player.matchId).emit('match:status', data);

      setTimeout(async () => {
        target.power /= this.increase;
        await redisService.setAllPlayerStatuses(target.playerId!, target);
        const timeoutData = await redisService.getMatchStatus(target.matchId);
        io.to(target.matchId).emit('match:status', timeoutData);
      }, this.duration);
    }
  }
}
