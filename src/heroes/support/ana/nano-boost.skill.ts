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

  async useTo(io: Namespace, redisService: RedisService, target: Hero) {
    if (this.isActive && target) {
      this.isActive = false;
      await updateMatchStatus(io, redisService, this);
      target.boostUp(io, redisService, this.duration);
    }
  }
}

Hero.prototype.boostUp = function (
  io: Namespace,
  redisService: RedisService,
  duration: number
) {
  this.isReinforced = true;
  for (const skill of Object.values(this.skills)) {
    if (skill.type === 'lethal' || skill.type === 'mixed') {
      skill.powerUp(io, redisService, this.increase, this.duration);
    }
  }

  setTimeout(() => {
    this.isReinforced = false;
    delete this.isReinforced;
  }, duration);
};
