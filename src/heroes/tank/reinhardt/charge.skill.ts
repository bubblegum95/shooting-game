import { Namespace } from 'socket.io';
import { logger, ModuleInitLog } from '../../../winston';
import { Skill } from '../../skill';
import { RedisService } from '../../../services/redis.service';
import { Reinhardt } from './reinhardt.hero';
import { updatePlayerStatus, updateSkillStatus } from '../../updateMatchStatus';
import { Hero } from '../../hero';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';

export class Charge extends Skill {
  constructor(
    public name: 'charge',
    public whose: Player['id'],
    public matchId: Match['id'],
    public category: 'secondary',
    public type1: 'lethal',
    public type2: 'mobility',
    public isActive: boolean,
    public isUsing: boolean,
    public cootime: number,
    public power: number,
    public point: number,
    public distance: number
  ) {
    super(name, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'Charge' });
  }

  async use(io: Namespace, redisService: RedisService, player: Reinhardt) {
    if (this.isActive) {
      this.isActive = false;
      this.isUsing = true;

      for (const skill of Object.values(player.skills)) {
        if (!(skill instanceof Charge)) {
          skill.isActive = false;
        }
      }

      await updatePlayerStatus(io, redisService, player);

      setTimeout(async () => {
        this.isActive = true;
        await updateSkillStatus(io, redisService, this);
      }, this.cootime);
    } else if (this.isUsing) {
      this.isUsing = false;

      for (const skill of Object.values(player.skills)) {
        if (!(skill instanceof Charge)) {
          skill.isActive = true;
        }
      }
      await updatePlayerStatus(io, redisService, player);
    }
  }

  async seize(io: Namespace, redisService: RedisService, target: Hero) {
    target.isOverwhelmed(io, redisService);
  }

  async push(io: Namespace, redisService: RedisService, target: Hero) {
    target.knockback = true;
    target.isPushed(io, redisService, this.distance);
  }

  async crash(
    io: Namespace,
    redisService: RedisService,
    target: Hero,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    await target.takeDamage(io, redisService, this.power, callback);
  }
}

Hero.prototype.isOverwhelmed = async function (
  io: Namespace,
  redisService: RedisService
) {
  if (!this.isOverpowered) {
    this.isOverpowered = true;
    for (const skill of Object.values(this.skills)) {
      if (skill) {
        skill.isActive = false;
      }
    }
    await updatePlayerStatus(io, redisService, this);
  } else {
    this.isOverpowered = false;
    for (const skill of Object.values(this.skills)) {
      if (skill) {
        skill.isActive = true;
      }
    }
    await updatePlayerStatus(io, redisService, this);
  }
};
