import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { RedisService } from '../../../redis.service';
import { Match } from '../../../../entities/match.entity';
import { Ana } from './ana';
import { Skill } from '../../skill';
import { ModuleInitLog, logger } from '../../../../winston';

export class BioticGrenade extends Skill {
  constructor(
    public name: string,
    public isActive: boolean,
    public increase: number,
    public duration: number, // 치유 차단 지속시간
    public cooltime: number
  ) {
    super(name, isActive, duration, cooltime);
    logger.info(ModuleInitLog, { filename: 'BioticGrenade' });
  }

  async useTo(
    io: Namespace,
    redisService: RedisService,
    player: Ana,
    target: Hero
  ) {
    // return 값은 io 에 보낼 결과값, socket으로 보낼 값은 쿨타임 남은 시간?
    if (this.isActive && target.playerId) {
      this.isActive = false;
      if (target.playerId && player.team === target.team) {
        target.health += this.increase;
      } else if (target.playerId && player.team !== target.team) {
        target.health -= this.increase;
        target.healBan(io, redisService, player.matchId, this.duration);
      }
      await redisService.setAllPlayerStatuses(target.playerId, target);
      await redisService.setAllPlayerStatuses(player.playerId, player);
      const result = await redisService.getMatchStatus(player.matchId);
      io.to(player.matchId).emit('match:status', result);

      setTimeout(async () => {
        this.isActive = true;
        await redisService.setAllPlayerStatuses(player.playerId!, player);
        const result = await redisService.getMatchStatus(player.matchId);
        io.to(player.matchId).emit('match:status', result);
      }, this.cooltime);
    }
  }
}

Hero.prototype.healBan = async function (
  io: Namespace,
  redisService: RedisService,
  matchId: Match['id'],
  duration: number
) {
  this.isHealBan = true;
  await redisService.setAllPlayerStatuses(this.playerId!, this);
  const result = await redisService.getMatchStatus(matchId);
  io.to(matchId).emit('match:status', result);

  setTimeout(async () => {
    this.isHealBan = false;
    await redisService.setAllPlayerStatuses(this.playerId!, this);
    const result = await redisService.getMatchStatus(matchId);
    io.to(matchId).emit('match:status', result);
  }, duration);
};
