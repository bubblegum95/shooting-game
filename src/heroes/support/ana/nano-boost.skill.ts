import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { RedisService } from '../../../services/redis.service';
import { ModuleInitLog, logger } from '../../../winston';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Skill } from '../../skill';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';
import { Team } from '../../../entities/team.entity';

export class NanoBoost extends Skill {
  constructor(
    public whose: Player['id'],
    public teamId: Team['id'],
    public matchId: Match['id'],
    public name: string,
    public category: 'ultimate',
    public type1: 'non-lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public duration: number, // 스킬 지속시간
    public increase: number // 공격력 증가량
  ) {
    super(name, teamId, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'NanoBoost' });
  }

  async useTo(
    io: Namespace,
    redisService: RedisService,
    target: Hero,
    callback: (io: Namespace, redisService: RedisService) => Promise<void>
  ) {
    if (this.isActive && target) {
      this.isActive = false;
      await updateMatchStatus(io, redisService, this);
      target.isReinforced(io, redisService, this.duration, callback);
    }
  }
}

Hero.prototype.isReinforced = function (
  io: Namespace,
  redisService: RedisService,
  duration: number,
  callback: (io: Namespace, redisService: RedisService) => Promise<void>
) {
  this.boostUp = true;
  this.takeKill = async function () {
    if (this.boostUp) {
      await callback(io, redisService);
    }
  };

  for (const skill of Object.values(this.skills)) {
    if (skill.type === 'lethal' || skill.type === 'mixed') {
      skill.powerUp(io, redisService, this.increase, this.duration);
    }
  }

  setTimeout(() => {
    this.boostUp = false;
    delete this.boostUp;
  }, duration);
};
