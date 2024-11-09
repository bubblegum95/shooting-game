import { Namespace } from 'socket.io';
import { Skill } from '../../skill';
import { RedisService } from '../../../services/redis.service';
import { Reinhardt } from './reinhardt.hero';
import { updatePlayerStatus, updateSkillStatus } from '../../updateMatchStatus';
import { logger, ModuleInitLog } from '../../../winston';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';

export class BarrierField extends Skill {
  constructor(
    public name: 'barrierField',
    public whose: Player['id'],
    public matchId: Match['id'],
    public category: 'secondary',
    public type1: 'non-lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public durability: number,
    public maxDurability: number,
    public cooltime: number,
    public isUsed: boolean
  ) {
    super(name, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'BarrierField' });
  }

  async use(io: Namespace, redisService: RedisService, player: Reinhardt) {
    if (this.isActive) {
      this.isUsed = true;
      player.useBarrierField(io, redisService);
    } else if (this.isUsed) {
      player.noUseBarrierField(io, redisService);
    }
  }

  async isNoDurability(
    io: Namespace,
    redisService: RedisService,
    player: Reinhardt
  ) {
    if (this.durability <= 0) {
      this.durability = 0;
      this.isActive = false;
      await updateSkillStatus(io, redisService, this);

      setTimeout(async () => {
        this.durability = this.maxDurability;
        this.isActive = true;
        await updateSkillStatus(io, redisService, this);
      }, this.cooltime);
    }
  }
}

Reinhardt.prototype.useBarrierField = async function (
  io: Namespace,
  redisService: RedisService
) {
  this.speed /= 2;

  for (const skill of Object.values(this.skills))
    if (!(skill instanceof BarrierField)) {
      skill.isActive = false;
      await updateSkillStatus(io, redisService, skill);
    }
};

Reinhardt.prototype.noUseBarrierField = async function (
  io: Namespace,
  redisService: RedisService
) {
  this.speed *= 2;

  for (const skill of Object.values(this.skills))
    if (!(skill instanceof BarrierField)) {
      skill.isActive = true;
      await updateSkillStatus(io, redisService, skill);
    }
};