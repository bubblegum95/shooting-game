import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { Ana } from './ana.hero';
import { RedisService } from '../../../services/redis.service';
import { ModuleInitLog, logger } from '../../../winston';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Skill } from '../../skill';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';

export class NanoBoost extends Skill {
  constructor(
    public name: string,
    public whose: Player['id'],
    public matchId: Match['id'],
    public category: 'ultimate',
    public type1: 'non-lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public duration: number, // 스킬 지속시간
    public increase: number // 공격력 증가량
  ) {
    super(name, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'NanoBoost' });
  }

  async isUseable(io: Namespace, redisService: RedisService, player: Ana) {
    super.isUseable(io, redisService, player);
  }

  async useTo(
    io: Namespace,
    redisService: RedisService,
    player: Ana,
    target: Hero
  ) {
    if (this.isActive && target) {
      this.isActive = false;
      await updateMatchStatus(io, redisService, player);
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
      skill.powerUp(io, redisService, this, this.increase, this.duration);
    }
  }

  setTimeout(() => {
    this.isReinforced = false;
    delete this.isReinforced;
  }, duration);
};

Skill.prototype.powerUp = async function (
  io: Namespace,
  redisService: RedisService,
  target: Hero,
  increase: number,
  duration: number
) {
  if (target.isReinforced) {
    this.power *= increase;
    await updateMatchStatus(io, redisService, target);

    setTimeout(async () => {
      this.power /= increase;
      await updateMatchStatus(io, redisService, target);
    }, duration);
  }
};
