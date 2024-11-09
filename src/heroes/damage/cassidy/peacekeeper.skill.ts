import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { RedisService } from '../../../services/redis.service';
import { ModuleInitLog, logger } from '../../../winston';
import { Skill } from '../../skill';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Team } from '../../../entities/team.entity';

export class Peacekeeper extends Skill {
  constructor(
    public name: string,
    public whose: Player['id'],
    public teamId: Team['id'],
    public matchId: Match['id'],
    public category: 'primary',
    public type1: 'lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public cooltime: number,
    public bullets: number,
    public maxBullets: number,
    public power: number,
    public point: number,
    public chargingTime: number
  ) {
    super(name, whose, teamId, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'Peacekeeper' });
  }

  async shot(io: Namespace, redisService: RedisService) {
    if (this.isActive && this.bullets > 0) {
      this.bullets -= 1;
      this.isActive = false;
      await updateMatchStatus(io, redisService, this);

      if (this.bullets <= 0) {
        this.chargeBullets(io, redisService);
      }

      setTimeout(async () => {
        this.isActive = true;
        await updateMatchStatus(io, redisService, this);
      }, this.cooltime);
    } else if (this.bullets <= 0) {
      this.chargeBullets(io, redisService);
    }
  }

  async heat(
    io: Namespace,
    redisService: RedisService,
    player: Hero,
    target: Hero | Skill,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    if (target instanceof Hero) {
      target.takeDamage(io, redisService, this.power, callback);
      await updateMatchStatus(io, redisService, target);
      player.ultimate += this.point;
      await updateMatchStatus(io, redisService, player);
    } else if (target instanceof Skill) {
      target.takeDamage(io, redisService, this.power);
    }
  }
}
