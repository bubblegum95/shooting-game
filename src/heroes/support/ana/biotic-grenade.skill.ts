import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { RedisService } from '../../../services/redis.service';
import { Ana } from './ana.hero';
import { ModuleInitLog, logger } from '../../../winston';
import { updatePlayerStatus, updateSkillStatus } from '../../updateMatchStatus';
import { Skill } from '../../skill';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';

export class BioticGrenade extends Skill {
  constructor(
    public name: string,
    public whose: Player['id'],
    public matchId: Match['id'],
    public category: 'secondary',
    public type1: 'mixed',
    public type2: 'throwing',
    public isActive: boolean,
    public power: number,
    public point: number,
    public duration: number, // 치유 증강/차단 지속시간
    public cooltime: number
  ) {
    super(name, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'BioticGrenade' });
  }

  async use(io: Namespace, redisService: RedisService, player: Ana) {
    // return 값은 io 에 보낼 결과값, socket으로 보낼 값은 쿨타임 남은 시간?
    if (this.isActive) {
      this.isActive = false;
      await updateSkillStatus(io, redisService, this);

      setTimeout(async () => {
        this.isActive = true;
        await updateSkillStatus(io, redisService, this);
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
    if (target.playerId && player.team === target.team) {
      target.takeHeal(io, redisService, this.power);
      player.ultimate += this.point;
      await updatePlayerStatus(io, redisService, target);
    } else if (target.playerId && player.team !== target.team) {
      target.takeDamage(io, redisService, this.power, callback);
      target.healBan(io, redisService, this.duration);
      player.ultimate += this.point;
      await updatePlayerStatus(io, redisService, target);
    }
  }
}

Hero.prototype.healBan = async function (
  io: Namespace,
  redisService: RedisService,
  duration: number
) {
  if (this.isAlive) {
    this.isHealBan = true;
    await updatePlayerStatus(io, redisService, this);

    setTimeout(async () => {
      this.isHealBan = false;
      await updatePlayerStatus(io, redisService, this);
    }, duration);
  }
};
